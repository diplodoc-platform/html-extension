import {GLOBAL_SYMBOL} from '../common';
import {HtmlController} from './HtmlController';
import './scss/html.scss';

if (typeof window?.document !== 'undefined' && !window[GLOBAL_SYMBOL]) {
    // window[GLOBAL_SYMBOL] = new HtmlController(document);
    // @ts-ignore
    window.test = window.test ? window.test : new HtmlController(document);
}
