import {IHtmlController} from '../types';

import {getScriptStore, useController} from '../common';
import {GLOBAL_SYMBOL} from '../constants';

export function useDiplodocHtml(): IHtmlController | null {
    const store = getScriptStore<IHtmlController>(GLOBAL_SYMBOL);
    const controller = useController<IHtmlController>(store);

    return controller;
}
