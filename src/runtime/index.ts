import {createLoadQueue, getScriptStore, isBrowser} from '../common';
import {GLOBAL_SYMBOL} from '../constants';
import {EmbeddedContentRootController} from './EmbeddedContentRootController';

if (isBrowser()) {
    const store = getScriptStore<EmbeddedContentRootController>(GLOBAL_SYMBOL);

    if (store) {
        const createController = () => new EmbeddedContentRootController(document);

        createLoadQueue<EmbeddedContentRootController>({
            store,
            createController,
        });
    }
}

export {EmbeddedContentRootController as HtmlController};

export type {
    ControllerCallback,
    IHTMLIFrameControllerConfig as IHTMLIFrameElementConfig,
    SetConfigArgs,
} from '../types';
