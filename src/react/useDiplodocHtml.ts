import {EmbeddedContentRootController} from '../runtime/EmbeddedContentRootController';

import {getScriptStore, useController} from '../common';
import {GLOBAL_SYMBOL} from '../constants';

export function useDiplodocHtml(): EmbeddedContentRootController | null {
    const store = getScriptStore<EmbeddedContentRootController>(GLOBAL_SYMBOL);
    const controller = useController<EmbeddedContentRootController>(store);

    return controller;
}
