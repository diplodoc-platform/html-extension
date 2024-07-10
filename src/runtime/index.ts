import {createLoadQueue, getScriptStore, hasScriptStore, isBrowser} from '../common';
import {GLOBAL_SYMBOL} from '../constants';
import {HtmlController} from './HtmlController';
import {IHtmlController} from '../types';

if (isBrowser() && !hasScriptStore(GLOBAL_SYMBOL)) {
    const store = getScriptStore<IHtmlController>(GLOBAL_SYMBOL);
    const htmlController = new HtmlController(document);

    createLoadQueue<HtmlController>({
        store,
        controller: htmlController,
    });
}

export {HtmlController};
export type {ControllerCallback, IHtmlController, IHtmlIFrameController} from '../types';
