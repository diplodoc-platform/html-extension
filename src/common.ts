import type {HtmlController} from './runtime/HtmlController';

export const GLOBAL_SYMBOL: unique symbol = Symbol.for('diplodocHtml');

declare global {
    interface Window {
        [GLOBAL_SYMBOL]: HtmlController;
    }
}

export const HTML_CLASSNAME = 'yfm-html';
export const HTML_DATA_ID = 'data-diplodoc-id';
export const HTML_DATA_KEY = 'data-diplodoc-key';

export const TOKEN_TYPE = 'yfm_html_block';
