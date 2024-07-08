import {Store, createLoadQueue, getScriptStore} from '../utils';
import {GLOBAL_SYMBOL} from '../constants';
import {HtmlController} from './HtmlController';
import {IHtmlController} from '../types';

let store: Store<IHtmlController> | null = null;

if (!store) {
    store = getScriptStore<IHtmlController>({prefix: GLOBAL_SYMBOL});
    const htmlController = new HtmlController(document);

    createLoadQueue<HtmlController>({
        store,
        controller: htmlController,
    });
}
