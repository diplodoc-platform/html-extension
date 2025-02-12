import type MarkdownIt from 'markdown-it';

import {directiveParser, registerContainerDirective} from '@diplodoc/directive';

import {ISOLATED_TOKEN_TYPE, SHADOW_TOKEN_TYPE, SRCDOC_TOKEN_TYPE} from '../constants';
import {BaseTarget, EmbeddingMode, Sanitize, SanitizeConfig, StylesObject} from '../types';

import {addHiddenProperty, dynrequire, getStyles} from './utils';
import {copyRuntimeFiles} from './copyRuntimeFiles';
import {makeIsolatedModeEmbedRenderRule} from './renderers/isolated';
import {makeShadowModeEmbedRenderRule} from './renderers/shadow';
import {makeSrcdocModeEmbedRenderRule} from './renderers/srcdoc';

export interface PluginOptions {
    embeddingMode: EmbeddingMode;
    runtimeJsPath: string;
    containerClasses: string;
    bundle: boolean;
    isolatedSandboxHost?: string;
    sanitize?: Sanitize | SanitizeConfig;
    /**
     * @deprecated Use the 'head' method instead.
     */
    styles?: string | StylesObject;
    /**
     * @deprecated Use the 'head' method instead.
     */
    baseTarget?: BaseTarget;
    head?: string;
    sandbox?: boolean | string;
}

type TransformOptions = {
    output?: string;
};

const emptyOptions = {};
const TAG = 'iframe';

const embeddingModeToTokenType = {
    srcdoc: SRCDOC_TOKEN_TYPE,
    shadow: SHADOW_TOKEN_TYPE,
    isolated: ISOLATED_TOKEN_TYPE,
} as const satisfies Record<EmbeddingMode, string>;

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
};

const registerTransform = (
    md: MarkdownIt,
    {embeddingMode, runtimeJsPath, output, bundle}: RegisterTransformOptions,
) => {
    md.use(directiveParser());

    registerContainerDirective(md, {
        name: 'html',
        type: 'code_block',
        container: {
            tag: TAG,
            token: embeddingModeToTokenType[embeddingMode],
        },
        match: (_params, state) => {
            const {env} = state;
            env.meta ||= {};
            env.meta.script ||= [];
            env.meta.style ||= [];
            if (!env.meta.script.includes(runtimeJsPath)) {
                env.meta.script.push(runtimeJsPath);
            }

            addHiddenProperty(env, 'bundled', new Set<string>());

            if (bundle) {
                copyRuntimeFiles({runtimeJsPath, output}, env.bundled);
            }

            return true;
        },
    });
};

export function transform({
    embeddingMode = 'srcdoc',
    runtimeJsPath = '_assets/html-extension.js',
    containerClasses = '',
    bundle = true,
    isolatedSandboxHost,
    sanitize,
    styles,
    baseTarget = '_parent',
    head: headContent,
    sandbox,
}: Partial<PluginOptions> = emptyOptions): MarkdownIt.PluginWithOptions<TransformOptions> {
    const sanitizeHead = typeof sanitize === 'function' ? sanitize : sanitize?.head;
    const sanitizeBody = typeof sanitize === 'function' ? sanitize : sanitize?.body;

    const plugin: MarkdownIt.PluginWithOptions<TransformOptions> = (md, options) => {
        const {output = '.'} = options || {};

        registerTransform(md, {embeddingMode, runtimeJsPath, bundle, output});

        md.renderer.rules[SRCDOC_TOKEN_TYPE] = makeSrcdocModeEmbedRenderRule({
            containerClassNames: containerClasses,
            sandbox,
            embedContentTransformFn: (raw) => {
                const deprecatedHeadContent = concatStylesIncludeDirectives(
                    `<base target="${baseTarget}">` +
                        // It's important to disable script by default in the srcDoc mode
                        `<meta http-equiv="Content-Security-Policy" content="script-src 'none'">`,
                    styles,
                );

                const rawHeadContent = headContent ?? deprecatedHeadContent;
                const headHtml = sanitizeHead?.(rawHeadContent) ?? rawHeadContent;
                const bodyHtml = sanitizeBody?.(raw) ?? raw;

                const head = `<head>${headHtml}</head>`;
                const body = `<body>${bodyHtml}</body>`;
                const html = `<!DOCTYPE html><html>${head}${body}</html>`;

                return html;
            },
        });

        md.renderer.rules[ISOLATED_TOKEN_TYPE] = makeIsolatedModeEmbedRenderRule({
            containerClassNames: containerClasses,
            baseTarget,
            isolatedSandboxHost,
            sandbox,
            embedContentTransformFn: (raw) => concatStylesIncludeDirectives(raw, styles),
        });

        md.renderer.rules[SHADOW_TOKEN_TYPE] = makeShadowModeEmbedRenderRule({
            containerClassNames: containerClasses,
            embedContentTransformFn: (raw) => {
                const withStyles = concatStylesIncludeDirectives(raw, styles);

                // Note that sanitization is only enabled for `shadow` embedding mode,
                // `isolated` mode applies no restrictions — beware of vulnerabilities galore!
                // That's why it's really important to host the iframe runtime on an unrelated `dummy` origin.
                return sanitizeBody?.(withStyles) ?? withStyles;
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
                });
            });

            md.parse(input, {});
        },
    });

    return plugin;
}
