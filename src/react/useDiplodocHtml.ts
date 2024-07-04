import {useCallback} from 'react';
import {GLOBAL_SYMBOL, HTMLControllerForEachCallback} from '../common';

export function useDiplodocHtml() {
    const reinitialize = useCallback(() => window?.[GLOBAL_SYMBOL]?.reinitialize(), []);
    const forEach = useCallback(
        (callback: HTMLControllerForEachCallback) => window?.[GLOBAL_SYMBOL]?.forEach(callback),
        [],
    );

    return {
        reinitialize,
        forEach,
    };
}
