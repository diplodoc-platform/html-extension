import directivePlugin from 'markdown-it-directive';
import type {DirectiveBlockHandler, MarkdownItWithDirectives} from 'markdown-it-directive';
import type {PluginWithOptions} from 'markdown-it';

import {ISOLATED_TOKEN_TYPE, SHADOW_TOKEN_TYPE} from '../constants';
import {addHiddenProperty, dynrequire, getStyles} from './utils';
import {copyRuntimeFiles} from './copyRuntimeFiles';
import {BaseTarget, EmbeddingMode, StylesObject} from '../types';
import {makeIsolatedModeEmbedRenderRule} from './renderers/isolated';
import {makeShadowModeEmbedRenderRule} from './renderers/shadow';
import MarkdownIt from 'markdown-it';

export interface PluginOptions {
    embeddingMode: EmbeddingMode;
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

const concatStylesIncludeDirectives = (content: string, styles?: string | StylesObject) => {
    if (styles) {
        const stylesContent =
            typeof styles === 'string'
                ? `<link rel="stylesheet" href="${styles}" />`
                : `<style>${getStyles(styles)}</style>`;

        return stylesContent + content;
    }

    return content;
};

type RegisterTransformOptions = Pick<
    PluginOptions,
    'runtimeJsPath' | 'bundle' | 'embeddingMode'
> & {
    output: string;
    updateTokens: boolean;
};

const registerTransform = (
    md: MarkdownIt,
    {embeddingMode, runtimeJsPath, output, bundle, updateTokens}: RegisterTransformOptions,
) => {
    const directiveHandler: DirectiveBlockHandler = ({state, content}) => {
        if (!content || !state) {
            return false;
        }

        const {env} = state;

        addHiddenProperty(env, 'bundled', new Set<string>());

        if (updateTokens) {
            const tokenType =
                embeddingMode === 'isolated' ? ISOLATED_TOKEN_TYPE : SHADOW_TOKEN_TYPE;

            const token = state.push(tokenType, TAG, 0);

            token.block = true;
            token.content = content;
        }

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

    (md as MarkdownItWithDirectives).blockDirectives['html'] = directiveHandler;
};

export function transform({
    embeddingMode = 'shadow',
    runtimeJsPath = '_assets/html-extension.js',
    containerClasses = '',
    bundle = true,
    isolatedSandboxHost,
    sanitize,
    styles,
    baseTarget = '_parent',
}: Partial<PluginOptions> = emptyOptions): PluginWithOptions<TransformOptions> {
    const plugin: PluginWithOptions<TransformOptions> = (md, options) => {
        const {output = '.'} = options || {};

        registerTransform(md, {embeddingMode, runtimeJsPath, bundle, output, updateTokens: true});

        (md as MarkdownItWithDirectives).renderer.rules[ISOLATED_TOKEN_TYPE] =
            makeIsolatedModeEmbedRenderRule({
                containerClassNames: containerClasses,
                baseTarget,
                isolatedSandboxHost,
                embedContentTransformFn: (raw) => concatStylesIncludeDirectives(raw, styles),
            });

        (md as MarkdownItWithDirectives).renderer.rules[SHADOW_TOKEN_TYPE] =
            makeShadowModeEmbedRenderRule({
                containerClassNames: containerClasses,
                embedContentTransformFn: (raw) => {
                    const withStyles = concatStylesIncludeDirectives(raw, styles);

                    // Note that sanitization is only enabled for `shadow` embedding mode,
                    // `isolated` mode applies no restrictions — beware of vulnerabilities galore!
                    // That's why it's really important to host the iframe runtime on an unrelated `dummy` origin.
                    return sanitize?.(withStyles) ?? withStyles;
                },
            });
    };

    Object.assign(plugin, {
        collect(input: string, {destRoot}: {destRoot: string}) {
            const MdIt = dynrequire('markdown-it');
            const md = new MdIt().use((md: MarkdownIt) => {
                registerTransform(md, {
                    embeddingMode,
                    runtimeJsPath,
                    bundle,
                    output: destRoot,
                    updateTokens: false,
                });
            });

            md.parse(input, {});
        },
    });

    return plugin;
}
