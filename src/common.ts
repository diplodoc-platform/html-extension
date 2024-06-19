import type {HtmlController} from './runtime/HtmlController';

export const GLOBAL_SYMBOL: unique symbol = Symbol.for('diplodocHtml');

declare global {
    interface Window {
        [GLOBAL_SYMBOL]: HtmlController;
    }
}
