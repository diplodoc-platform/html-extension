import type {PluginSimple, PluginWithOptions} from 'markdown-it';

import {addHiddenProperty, defaultSanitize} from './utils';
import {copyRuntimeFiles} from './copyRuntimeFiles';
import directivePlugin from 'markdown-it-directive';
import type {DirectiveBlockHandler, MarkdownItWithDirectives} from 'markdown-it-directive';

export const TOKEN_TYPE = 'yfm_html_block';
export const HTML_CLASSNAME = 'yfm-html';

export const TokenAttr = {
    class: 'class',
    frameborder: 'frameborder',
    style: 'style',
    srcdoc: 'srcdoc',
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

const empty = {};

export function transform({
    runtimeJsPath = '_assets/html-extension.js',
    runtimeCssPath = '_assets/html-extension.css',
    containerClasses = '',
    bundle = true,
    sanitize = defaultSanitize,
    shouldUseSanitize = false,
    shouldUseIframe = true,
}: Partial<PluginOptions> = empty): PluginWithOptions<TransformOptions> {
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
            token.block = true;
            token.attrSet(
                TokenAttr.class,
                [HTML_CLASSNAME, containerClasses].filter(Boolean).join(' '),
            );

            if (shouldUseIframe) {
                token.attrPush([TokenAttr.frameborder, '0']);
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
        md.use(directivePlugin as PluginSimple);

        const mdDir = md as MarkdownItWithDirectives;
        mdDir.blockDirectives['html'] = plugin;
        mdDir.renderer.rules[TOKEN_TYPE] = (tokens, idx, _opts, _env, self) => {
            const token = tokens[idx];
            return `<${token.tag}${self.renderAttrs(token)}></${token.tag}>`;
        };
    };
}
