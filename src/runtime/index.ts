import {createLoadQueue, getScriptStore, isBrowser} from '../common';
import {GLOBAL_SYMBOL} from '../constants';
import {HtmlController} from './HtmlController';
import {IHtmlController} from '../types';

if (isBrowser()) {
    const store = getScriptStore<IHtmlController>(GLOBAL_SYMBOL);

    if (store) {
        const createController = () => new HtmlController(document);

        createLoadQueue<HtmlController>({
            store,
            createController,
        });
    }
}

export {HtmlController};

export type {
    ControllerCallback,
    ForEachCallbackArgs,
    IHtmlController,
    IHtmlIFrameController,
    IHtmlControllerConfig,
    SetConfigArgs,
} from '../types';
