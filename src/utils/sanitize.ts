import type {SanitizeOptions} from '@diplodoc/transform/lib/sanitize';

import * as sanitizeModule from '@diplodoc/transform/lib/sanitize';

type SanitizeFn = (
    html: string,
    options?: SanitizeOptions,
    additionalOptions?: SanitizeOptions,
) => string;

interface SanitizeModule {
    sanitize?: SanitizeFn;
    default?: SanitizeFn;
}

const sanitizeAll = () => {
    if (typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn('[YfmHtmlBlock]: sanitize function not found');
    }
    return '';
};
const getSanitizeFunction = (): SanitizeFn => {
    const module = sanitizeModule as SanitizeModule;
    const sanitize = 'sanitize' in module && module.sanitize ? module.sanitize : module.default;
    return sanitize instanceof Function ? sanitize : sanitizeAll;
};

// MAJOR: use `import {sanitize} from '@diplodoc/transform/lib/sanitize.js'`
const diplodocSanitize = getSanitizeFunction();

const {defaultOptions: sanitizeDefaultOptions} = sanitizeModule;

// yfmHtmlBlock additional css properties white list
const getYfmHtmlBlockWhiteList = () => {
    const whiteList: Record<string, boolean> = {};

    // flex, grid, column
    whiteList['align-content'] = true; // default: auto
    whiteList['align-items'] = true; // default: auto
    whiteList['align-self'] = true; // default: auto
    whiteList.columns = true; // default: depending on individual properties
    whiteList['column-count'] = true; // default: auto
    whiteList['column-fill'] = true; // default: balance
    whiteList['column-gap'] = true; // default: normal
    whiteList['column-rule'] = true; // default: depending on individual properties
    whiteList['column-rule-color'] = true; // default: current color
    whiteList['column-rule-style'] = true; // default: medium
    whiteList['column-rule-width'] = true; // default: medium
    whiteList['column-span'] = true; // default: none
    whiteList['column-width'] = true; // default: auto
    whiteList.flex = true; // default: depending on individual properties
    whiteList['flex-basis'] = true; // default: auto
    whiteList['flex-direction'] = true; // default: row
    whiteList['flex-flow'] = true; // default: depending on individual properties
    whiteList['flex-grow'] = true; // default: 0
    whiteList['flex-shrink'] = true; // default: 1
    whiteList['flex-wrap'] = true; // default: nowrap
    whiteList.gap = true; // default: normal normal
    whiteList.grid = true; // default: depending on individual properties
    whiteList['grid-area'] = true; // default: depending on individual properties
    whiteList['grid-auto-columns'] = true; // default: auto
    whiteList['grid-auto-flow'] = true; // default: none
    whiteList['grid-auto-rows'] = true; // default: auto
    whiteList['grid-column'] = true; // default: depending on individual properties
    whiteList['grid-column-end'] = true; // default: auto
    whiteList['grid-column-start'] = true; // default: auto
    whiteList['grid-row'] = true; // default: depending on individual properties
    whiteList['grid-row-end'] = true; // default: auto
    whiteList['grid-row-start'] = true; // default: auto
    whiteList['grid-template'] = true; // default: depending on individual properties
    whiteList['grid-template-areas'] = true; // default: none
    whiteList['grid-template-columns'] = true; // default: none
    whiteList['grid-template-rows'] = true; // default: none
    whiteList['justify-content'] = true; // default: auto
    whiteList['justify-items'] = true; // default: auto
    whiteList['justify-self'] = true; // default: auto
    whiteList['line-height'] = true; // default: normal
    whiteList['object-fit'] = true; // default: fill
    whiteList['object-position'] = true; // default: 50% 50%
    whiteList.order = true; // default: 0
    whiteList.orphans = true; // default: 2
    whiteList['row-gap'] = true;

    // position, opacity, overflow
    whiteList['all'] = true; // default: depending on individual properties
    whiteList['bottom'] = true; // default: auto
    whiteList['content'] = true; // default: normal
    whiteList['cursor'] = true; // default: auto
    whiteList['direction'] = true; // default: ltr
    whiteList['left'] = true; // default: auto
    whiteList['line-break'] = true; // default: auto
    whiteList['opacity'] = true; // default: 1
    whiteList['overflow'] = true; // default: depending on individual properties
    whiteList['overflow-wrap'] = true; // default: normal
    whiteList['overflow-x'] = true; // default: visible
    whiteList['overflow-y'] = true; // default: visible
    whiteList['position'] = true; // default: static
    whiteList['right'] = true; // default: auto
    whiteList['top'] = true; // default: auto
    whiteList['white-space'] = true; // default: normal
    whiteList['z-index'] = true; // default: auto

    return whiteList;
};

const defaultEmptyOptions: SanitizeOptions = {
    allowedTags: [],
    cssWhiteList: {},
    allowedAttributes: {},
};

type AllowedAttributesType = Record<
    string,
    (string | {name: string; multiple?: boolean | undefined; values: string[]})[]
>;

export const getYfmHtmlBlockOptions = (
    options: SanitizeOptions = defaultEmptyOptions,
    defaultOptions: SanitizeOptions = sanitizeDefaultOptions,
): SanitizeOptions => {
    const defaultAllowedAttributes = defaultOptions.allowedAttributes as AllowedAttributesType;

    return {
        ...defaultOptions,
        allowedAttributes: {
            ...defaultAllowedAttributes,
            ...options.allowedAttributes,
        },
        allowedTags:
            typeof options.allowedTags === 'boolean'
                ? options.allowedTags
                : [
                      ...(Array.isArray(defaultOptions.allowedTags)
                          ? defaultOptions.allowedTags
                          : []),
                      ...(Array.isArray(options.allowedTags) ? options.allowedTags : []),
                  ],
        cssWhiteList: {
            ...defaultOptions.cssWhiteList,
            ...options.cssWhiteList,
        },
    };
};

export interface GetSanitizeYfmHtmlBlockArgs {
    options: SanitizeOptions;
    sanitize?: (html: string, options?: SanitizeOptions) => string;
}
export const getSanitizeYfmHtmlBlock =
    ({options, sanitize = diplodocSanitize}: GetSanitizeYfmHtmlBlockArgs) =>
    (content: string) =>
        sanitize(content, getYfmHtmlBlockOptions(options));

export const htmlBlockDefaultSanitizer = {
    head: getSanitizeYfmHtmlBlock({
        options: {
            allowedTags: ['title', 'style', 'link', 'meta', 'base'],
            allowedAttributes: {
                meta: ['name', 'http-equiv', 'content', 'charset'],
                link: ['rel', 'href'],
                base: ['target'],
            },
        },
    }),
    body: getSanitizeYfmHtmlBlock({
        options: {
            allowedTags: ['style'],
            allowedAttributes: {
                style: [],
            },
            cssWhiteList: getYfmHtmlBlockWhiteList(),
        },
    }),
};
