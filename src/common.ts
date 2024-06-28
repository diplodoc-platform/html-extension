import type {HtmlController} from './runtime/HtmlController';

export const GLOBAL_SYMBOL: unique symbol = Symbol.for('diplodocHtml');

declare global {
    interface Window {
        [GLOBAL_SYMBOL]: HtmlController;
    }
}

export const BLOCK_NAME = 'yfm-html';
export const HTML_DATA_ID = 'data-diplodoc-id';
export const HTML_DATA_KEY = 'data-diplodoc-key';

export const TOKEN_TYPE = 'yfm_html_block';

export type HTMLControllerForEachCallback = (block: IHtmlIFrameController) => void;

export interface IHtmlIFrameController {
    readonly block: HTMLIFrameElement;
    execute(callback: (controller: IHtmlIFrameController) => void): void;
    setStyles(styles: Record<string, string>): void;
}
