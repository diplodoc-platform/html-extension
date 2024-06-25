import type {PluginWithOptions} from 'markdown-it';

import {addHiddenProperty, defaultSanitize} from './utils';
import {copyRuntimeFiles} from './copyRuntimeFiles';
import directivePlugin from 'markdown-it-directive';
import type {DirectiveBlockHandler, MarkdownItWithDirectives} from 'markdown-it-directive';
import {generateID} from '@diplodoc/transform/lib/plugins/utils';
import {HTML_CLASSNAME, HTML_DATA_ID, HTML_DATA_KEY, TOKEN_TYPE} from '../common';

export const TokenAttr = {
    class: 'class',
    dataId: HTML_DATA_ID,
    dataKey: HTML_DATA_KEY,
    frameborder: 'frameborder',
    id: 'id',
    srcdoc: 'srcdoc',
    style: 'style',
} as const;

export type PluginOptions = {
    runtimeJsPath: string;
    runtimeCssPath: string;
    containerClasses: string;
    bundle: boolean;
    sanitize: (dirtyHtml: string) => string;
    shouldUseSanitize: boolean;
    shouldUseIframe: boolean;
};

type TransformOptions = {
    output?: string;
};

const emptyOptions = {};

export function transform({
    runtimeJsPath = '_assets/html-extension.js',
    runtimeCssPath = '_assets/html-extension.css',
    containerClasses = '',
    bundle = true,
    sanitize = defaultSanitize,
    shouldUseSanitize = false,
    shouldUseIframe = true,
}: Partial<PluginOptions> = emptyOptions): PluginWithOptions<TransformOptions> {
    return function html(md, options) {
        const {output = '.'} = options || {};

        const plugin: DirectiveBlockHandler = ({state, content}) => {
            if (!content || !state) {
                return false;
            }

            const {env} = state;

            addHiddenProperty(env, 'bundled', new Set<string>());

            const tag = shouldUseIframe ? 'iframe' : 'div';
            const token = state.push(TOKEN_TYPE, tag, 0);
            const htmlBlockId = generateID();

            token.block = true;
            token.attrSet(
                TokenAttr.class,
                [HTML_CLASSNAME, containerClasses, `${HTML_CLASSNAME}-${htmlBlockId}`].filter(Boolean).join(' '),
            );

            if (shouldUseIframe) {
                token.attrPush([TokenAttr.dataId, htmlBlockId]);
                token.attrPush([TokenAttr.dataKey, 'html-block']);
                token.attrPush([TokenAttr.frameborder, '0']);
                token.attrPush([TokenAttr.id, htmlBlockId]);
                token.attrPush([TokenAttr.style, 'width:100%']);
            }

            const resultHtml = shouldUseSanitize ? sanitize(content) : content;

            token.attrPush([TokenAttr.srcdoc, resultHtml]);

            // TODO: use collect
            env.meta = env.meta || {};
            env.meta.script = env.meta.script || [];
            env.meta.style = env.meta.style || [];
            env.meta.script.push(runtimeJsPath);
            env.meta.style.push(runtimeCssPath);

            if (bundle) {
                copyRuntimeFiles({runtimeJsPath, runtimeCssPath, output}, env.bundled);
            }

            return true;
        };

        // the directives plugin must be enabled
        md.use(directivePlugin);

        const mdDir = md as MarkdownItWithDirectives;
        mdDir.blockDirectives['html'] = plugin;
        mdDir.renderer.rules[TOKEN_TYPE] = (tokens, idx, _opts, _env, self) => {
            const token = tokens[idx];
            return `<${token.tag}${self.renderAttrs(token)}></${token.tag}>`;
        };
    };
}
