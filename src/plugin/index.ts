import type {SanitizeOptions} from '@diplodoc/transform/lib/sanitize.js';
import type {StylesObject} from '../types';
import type {YfmHtmlBlockBuildOptions} from '../utils/sanitize';

import {
    buildYfmHtmlBlockOptions,
    htmlBlockDefaultSanitizer,
    yfmHtmlBlockOptions,
} from '../utils/sanitize';

import {transform} from './transform';
import {getStyles} from './utils';

export type {BaseTarget, StylesObject, HTMLRuntimeConfig, EmbeddingMode} from '../types';
export type {PluginOptions} from './transform';
export type {YfmHtmlBlockBuildOptions} from '../utils/sanitize';
export {
    buildYfmHtmlBlockOptions,
    getStyles,
    htmlBlockDefaultSanitizer,
    transform,
    yfmHtmlBlockOptions,
};

// Explicitly typed to stop tsc from inlining the default shape via
// `import(".").Foo` — self-references do not resolve under NodeNext.
export interface HtmlExtensionNamespace {
    buildYfmHtmlBlockOptions: (options: YfmHtmlBlockBuildOptions) => SanitizeOptions;
    getStyles: (styles: StylesObject) => string;
    htmlBlockDefaultSanitizer: typeof htmlBlockDefaultSanitizer;
    transform: typeof transform;
    yfmHtmlBlockOptions: typeof yfmHtmlBlockOptions;
}

const htmlExtension: HtmlExtensionNamespace = {
    buildYfmHtmlBlockOptions,
    getStyles,
    htmlBlockDefaultSanitizer,
    transform,
    yfmHtmlBlockOptions,
};

export default htmlExtension;
