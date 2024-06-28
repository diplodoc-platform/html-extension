import {GLOBAL_SYMBOL} from '../common';
import {HtmlController} from './HtmlController';

if (typeof window?.document !== 'undefined' && !window[GLOBAL_SYMBOL]) {
    window[GLOBAL_SYMBOL] = new HtmlController(document);
}
