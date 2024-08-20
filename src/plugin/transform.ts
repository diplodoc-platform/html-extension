import directivePlugin from 'markdown-it-directive';
import type {DirectiveBlockHandler, MarkdownItWithDirectives} from 'markdown-it-directive';
import type {PluginWithOptions} from 'markdown-it';

import {BLOCK_NAME, HTML_DATA_ID, HTML_DATA_KEY, TOKEN_TYPE} from '../constants';
import {addHiddenProperty, getStyles} from './utils';
import {copyRuntimeFiles} from './copyRuntimeFiles';
import {BaseTarget, StylesObject} from '../types';

const generateHtmlBlockId = () => `${BLOCK_NAME}-${Math.random().toString(36).substr(2, 8)}`;

export const TokenAttr = {
    class: 'class',
    dataId: HTML_DATA_ID,
    dataKey: HTML_DATA_KEY,
    frameborder: 'frameborder',
    id: 'id',
    srcdoc: 'srcdoc',
    style: 'style',
} as const;

export interface PluginOptions {
    runtimeJsPath: string;
    containerClasses: string;
    bundle: boolean;
    sanitize?: (dirtyHtml: string) => string;
    /**
     * @deprecated Use the 'head' method instead.
     */
    styles?: string | StylesObject;
    /**
     * @deprecated Use the 'head' method instead.
     */
    baseTarget?: BaseTarget;
    head?: string;
}

type TransformOptions = {
    output?: string;
};

const emptyOptions = {};
const TAG = 'iframe';

export function transform({
    runtimeJsPath = '_assets/html-extension.js',
    containerClasses = '',
    bundle = true,
    sanitize,
    styles,
    baseTarget = '_parent',
    head: headContent = '',
}: Partial<PluginOptions> = emptyOptions): PluginWithOptions<TransformOptions> {
    return function html(md, options) {
        const {output = '.'} = options || {};

        const plugin: DirectiveBlockHandler = ({state, content}) => {
            if (!content || !state) {
                return false;
            }

            const {env} = state;

            addHiddenProperty(env, 'bundled', new Set<string>());

            const token = state.push(TOKEN_TYPE, TAG, 0);
            const htmlBlockId = generateHtmlBlockId();
            const className = [BLOCK_NAME, containerClasses].filter(Boolean).join(' ');

            token.block = true;

            token.attrSet(TokenAttr.class, className);
            token.attrPush([TokenAttr.dataId, htmlBlockId]);
            token.attrPush([TokenAttr.dataKey, BLOCK_NAME]);
            token.attrPush([TokenAttr.frameborder, '0']);
            token.attrPush([TokenAttr.id, htmlBlockId]);
            token.attrPush([TokenAttr.style, 'width:100%']);
            token.attrPush([TokenAttr.srcdoc, content]);

            // TODO: use collect
            env.meta = env.meta || {};
            env.meta.script = env.meta.script || [];
            env.meta.style = env.meta.style || [];
            if (!env.meta.script.includes(runtimeJsPath)) {
                env.meta.script.push(runtimeJsPath);
            }

            if (bundle) {
                copyRuntimeFiles({runtimeJsPath, output}, env.bundled);
            }

            return true;
        };

        // the directives plugin must be enabled
        md.use(directivePlugin);

        const mdDir = md as MarkdownItWithDirectives;
        mdDir.blockDirectives['html'] = plugin;
        mdDir.renderer.rules[TOKEN_TYPE] = (tokens, idx, _opts, _env, self) => {
            const token = tokens[idx];

            let additional = baseTarget ? `<base target="${baseTarget}">` : '';
            if (styles) {
                const stylesContent =
                    typeof styles === 'string'
                        ? `<link rel="stylesheet" href="${styles}" />`
                        : `<style>${getStyles(styles)}</style>`;
                additional += stylesContent;
            }

            const head = `<head>${headContent || additional}</head>`;
            const body = `<body>${token.attrGet(TokenAttr.srcdoc) ?? ''}</body>`;
            const html = `<!DOCTYPE html><html>${head}${body}</html>`;

            const resultHtml = sanitize ? sanitize(html) : html;
            token.attrSet(TokenAttr.srcdoc, resultHtml);

            return `<${token.tag}${self.renderAttrs(token)}></${token.tag}>`;
        };
    };
}
