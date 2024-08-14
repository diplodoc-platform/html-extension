import directivePlugin from 'markdown-it-directive';
import type {DirectiveBlockHandler, MarkdownItWithDirectives} from 'markdown-it-directive';
import type {PluginWithOptions} from 'markdown-it';

import {
    DATAATTR_ISOLATED_SANDBOX_BASE_TARGET,
    DATAATTR_ISOLATED_SANDBOX_CONTENT,
    DATAATTR_SANDBOX_MODE,
    ISOLATED_TOKEN_TYPE,
    SHADOW_TOKEN_TYPE,
} from '../constants';
import {addHiddenProperty, getStyles} from './utils';
import {copyRuntimeFiles} from './copyRuntimeFiles';
import {BaseTarget, StylesObject} from '../types';

export interface PluginOptions {
    runtimeJsPath: string;
    containerClasses: string;
    bundle: boolean;
    isolatedSandboxHost?: string;
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
    isolatedSandboxHost,
    sanitize,
    styles,
    baseTarget = '_parent',
}: Partial<PluginOptions> = emptyOptions): PluginWithOptions<TransformOptions> {
    return function html(md, options) {
        const {output = '.'} = options || {};

        const plugin: DirectiveBlockHandler = ({state, content, inlineContent}) => {
            if (!content || !state) {
                return false;
            }

            const {env} = state;

            addHiddenProperty(env, 'bundled', new Set<string>());

            const tokenType =
                inlineContent === 'isolated' ? ISOLATED_TOKEN_TYPE : SHADOW_TOKEN_TYPE;

            const token = state.push(tokenType, TAG, 0);

            token.block = true;
            token.content = content;

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

        mdDir.renderer.rules[ISOLATED_TOKEN_TYPE] = (tokens, idx, _opts, _env, self) => {
            const token = tokens[idx];

            if (typeof isolatedSandboxHost !== 'string') {
                throw new Error(
                    'Please provide `isolatedSandboxHost` plugin option to use the `isolated` HTML sandboxing mode.',
                );
            }

            let content = token.content;

            if (styles) {
                const stylesContent =
                    typeof styles === 'string'
                        ? `<link rel="stylesheet" href="${styles}" />`
                        : `<style>${getStyles(styles)}</style>`;
                content += stylesContent;
            }

            const resultContent = sanitize ? sanitize(content) : content;

            token.attrSet('src', isolatedSandboxHost);
            token.attrSet('class', containerClasses);
            token.attrSet('frameborder', '0');
            token.attrSet('style', 'width:100%');
            token.attrSet(DATAATTR_SANDBOX_MODE, 'isolated');
            token.attrSet(DATAATTR_ISOLATED_SANDBOX_CONTENT, resultContent);
            token.attrSet(DATAATTR_ISOLATED_SANDBOX_BASE_TARGET, baseTarget);

            return `<iframe ${self.renderAttrs(token)}></iframe>`;
        };

        mdDir.renderer.rules[SHADOW_TOKEN_TYPE] = (tokens, idx, _opts, _env, self) => {
            const token = tokens[idx];

            let content = token.content;

            if (styles) {
                const stylesContent =
                    typeof styles === 'string'
                        ? `<link rel="stylesheet" href="${styles}" />`
                        : `<style>${getStyles(styles)}</style>`;
                content = stylesContent + content;
            }

            const resultContent = sanitize ? sanitize(content) : content;

            token.attrSet('class', containerClasses);
            token.attrSet('style', 'width:100%;all:initial;');
            token.attrSet(DATAATTR_SANDBOX_MODE, 'shadow');

            return `<div ${self.renderAttrs(token)}><template shadowrootmode="open">${resultContent}</template></div>`;
        };
    };
}
