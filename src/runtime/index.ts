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

/**
 * @deprecated `@diplodoc/html-extension/runtime` is a `<script src>` IIFE
 * bundle, not an importable ESM/CJS module. These re-exports describe the
 * in-bundle controller that attaches itself to the browser globals — they
 * are not meant to be imported programmatically and will be removed in the
 * next major. For Node/SSR work, use `@diplodoc/html-extension` (plugin entry).
 */
export {EmbeddedContentRootController as HtmlController};

/** @deprecated see `HtmlController` above */
export type {
    ControllerCallback,
    EmbedsConfig as IHTMLIFrameElementConfig,
    SetConfigArgs,
} from '../types';
