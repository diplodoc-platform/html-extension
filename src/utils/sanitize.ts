import type {SanitizeOptions} from '@diplodoc/transform/lib/sanitize';
import type {DefaultTreeAdapterMap} from 'parse5';

import {parseFragment, serialize} from 'parse5';
import * as sanitizeModule from '@diplodoc/transform/lib/sanitize';

type DefaultTreeAdapterMapNode = DefaultTreeAdapterMap['node'];
type DefaultTreeAdapterMapElement = DefaultTreeAdapterMap['element'];

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
const sanitizeDefaultAllowedTags = Array.isArray(sanitizeDefaultOptions.allowedTags)
    ? sanitizeDefaultOptions.allowedTags
    : [];

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

type AllowedAttributesType = Record<
    string,
    (string | {name: string; multiple?: boolean | undefined; values: string[]})[]
>;

/**
 * Options for building sanitize config for yfm-html-block
 */
export interface YfmHtmlBlockBuildOptions {
    allowedTags?: string[];
    disallowedTags?: string[];
    allowedAttributes?: SanitizeOptions['allowedAttributes'];
    cssWhiteList?: SanitizeOptions['cssWhiteList'];
}

export const buildYfmHtmlBlockOptions = (options: YfmHtmlBlockBuildOptions): SanitizeOptions => {
    const {
        allowedTags = [],
        disallowedTags = [],
        allowedAttributes = {},
        cssWhiteList = {},
    } = options;

    const disallowed = new Set(disallowedTags.map((t) => t.toLowerCase()));

    const mergedAllowedTags = [...sanitizeDefaultAllowedTags, ...allowedTags].filter(
        (tag) => !disallowed.has(tag.toLowerCase()),
    );

    return {
        ...sanitizeDefaultOptions,
        allowedTags: [...new Set(mergedAllowedTags)],
        allowedAttributes: {
            ...(sanitizeDefaultOptions.allowedAttributes as AllowedAttributesType),
            ...allowedAttributes,
        },
        cssWhiteList: {
            ...sanitizeDefaultOptions.cssWhiteList,
            ...cssWhiteList,
        },
    };
};

const cssWhiteList = getYfmHtmlBlockWhiteList();
export const yfmHtmlBlockOptions = {
    head: {
        allowedTags: ['title', 'style', 'link', 'meta', 'base'],
        disallowedTags: ['iframe', 'frame', 'frameset', 'object', 'embed'],
        allowedAttributes: {
            meta: ['name', 'http-equiv', 'content', 'charset'],
            link: ['rel', 'href'],
            base: ['target'],
        },
        cssWhiteList,
    },
    body: {
        allowedTags: ['style', 'iframe'],
        disallowedTags: ['frame', 'frameset', 'object', 'embed'],
        allowedAttributes: {
            style: [],
            iframe: [
                'src',
                'width',
                'height',
                'frameborder',
                'loading',
                'title',
                'referrerpolicy',
                'sandbox',
            ],
        },
        cssWhiteList,
    },
};

/**
 * Tags whose content is treated as raw text by the HTML5 spec.
 * A fake closing tag hidden inside their content can trick parsers into
 * executing attacker-controlled markup.
 *
 * We strip children of these elements after parsing with a
 * spec-compliant parser (parse5) so that sanitize-html (htmlparser2)
 * never sees the ambiguous raw-text content.
 */
const RAW_TEXT_TAGS_TO_STRIP: ReadonlySet<string> = new Set([
    'iframe',
    'noscript',
    'xmp',
    'noembed',
    'noframes',
    'plaintext',
]);

function stripRawTextChildren(node: DefaultTreeAdapterMapNode): void {
    if (!('childNodes' in node)) {
        return;
    }

    for (const child of node.childNodes) {
        stripRawTextChildren(child);
    }

    if (
        'tagName' in node &&
        RAW_TEXT_TAGS_TO_STRIP.has((node as DefaultTreeAdapterMapElement).tagName)
    ) {
        (node as DefaultTreeAdapterMapElement).childNodes = [];
    }
}

/**
 * Normalize HTML through a spec-compliant HTML5 parser to prevent
 * mutation XSS attacks.
 *
 * 1. Parse with parse5 (follows HTML5 spec exactly like browsers).
 * 2. Strip children of raw-text elements (iframe, noscript, etc.)
 *    so that fake closing tags hidden in their content cannot trick
 *    the downstream htmlparser2-based sanitizer.
 * 3. Re-serialize to canonical HTML safe for sanitize-html.
 */
const canonicalize = (html: string): string => {
    const tree = parseFragment(html);
    stripRawTextChildren(tree);
    return serialize(tree);
};

export const htmlBlockDefaultSanitizer = {
    head: (content: string) =>
        diplodocSanitize(canonicalize(content), buildYfmHtmlBlockOptions(yfmHtmlBlockOptions.head)),
    body: (content: string) =>
        diplodocSanitize(canonicalize(content), buildYfmHtmlBlockOptions(yfmHtmlBlockOptions.body)),
};
