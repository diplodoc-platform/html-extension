import {createLoadQueue, getScriptStore, isBrowser} from '../common';
import {GLOBAL_SYMBOL} from '../constants';
import {HtmlController} from './HtmlController';
import {IHtmlController} from '../types';

if (isBrowser()) {
    const store = getScriptStore<IHtmlController>(GLOBAL_SYMBOL);

    if (store) {
        const createController = () => new HtmlController(document, {
            classNames: ['dark'],
            styles: {
                'background-color': '#BBB',
                'color': '#A33',
            },
        });

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
    SetConfigArgs,
} from '../types';
