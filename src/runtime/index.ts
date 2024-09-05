import {createLoadQueue, getScriptStore, isBrowser} from '../common';

import {EmbeddedContentRootController} from './EmbeddedContentRootController';

if (isBrowser()) {
    const store = getScriptStore();

    if (store) {
        const createController = () => new EmbeddedContentRootController(document);

        createLoadQueue({
            store,
            createController,
        });
    }
}

export {EmbeddedContentRootController as HtmlController};

export type {
    ControllerCallback,
    EmbedsConfig as IHTMLIFrameElementConfig,
    SetConfigArgs,
} from '../types';
