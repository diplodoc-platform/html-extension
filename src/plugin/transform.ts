import type {PluginWithOptions} from 'markdown-it';

import {addHiddenProperty} from './utils';
import {copyRuntimeFiles} from './copyRuntimeFiles';
import directivePlugin from 'markdown-it-directive';
import type {DirectiveBlockHandler, MarkdownItWithDirectives} from 'markdown-it-directive';
import {BLOCK_NAME, HTML_DATA_ID, HTML_DATA_KEY, TOKEN_TYPE} from '../common';
import {generateID} from '@diplodoc/transform/lib/plugins/utils';

const generateHtmlBlockId = () => `${BLOCK_NAME}-${generateID()}`;

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
    containerClasses: string;
    bundle: boolean;
    sanitize?: (dirtyHtml: string) => string;
};

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

            token.block = true;
            token.attrSet(
                TokenAttr.class,
                [BLOCK_NAME, containerClasses].filter(Boolean).join(' '),
            );

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
            const rendered = self.renderAttrs(token);
            const resultRendered = sanitize ? sanitize(rendered) : rendered;

            return `<${token.tag}${resultRendered}></${token.tag}>`;
        };
    };
}