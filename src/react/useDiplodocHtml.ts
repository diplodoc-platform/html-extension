import {useCallback} from 'react';
import {GLOBAL_SYMBOL, HTMLControllerForEachCallback} from '../common';

export function useDiplodocHtml() {
    return {
        reinitialize: useCallback(() => window[GLOBAL_SYMBOL].reinitialize(), []),
        forEach: useCallback(
            (callback: HTMLControllerForEachCallback) => window[GLOBAL_SYMBOL].forEach(callback),
            [],
        ),
    };
}
