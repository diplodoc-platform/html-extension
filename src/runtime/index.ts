import {GLOBAL_SYMBOL} from '../common';
import {TabsController} from './TabsController';
import './scss/tabs.scss';

if (typeof window !== 'undefined' && typeof document !== 'undefined' && !window[GLOBAL_SYMBOL]) {
    window[GLOBAL_SYMBOL] = new TabsController(document);
}
