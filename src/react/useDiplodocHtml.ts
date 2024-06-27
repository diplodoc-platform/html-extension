import {useCallback} from 'react';
import {GLOBAL_SYMBOL} from '../common';
import {HTMLControllerForEachCallback} from '../runtime/HtmlController';

export function useDiplodocHtml() {
    return {
        reinitialize: useCallback(() => window[GLOBAL_SYMBOL].reinitialize(), []),
        forEach: useCallback(
            (callback: HTMLControllerForEachCallback) => window[GLOBAL_SYMBOL].forEach(callback),
            [],
        ),
    };
}
