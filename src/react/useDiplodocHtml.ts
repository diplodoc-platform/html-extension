import {useCallback} from 'react';
import {GLOBAL_SYMBOL, HTMLControllerForEachCallback} from '../common';

export function useDiplodocHtml(isLoaded = true) {
    const reinitialize = useCallback(() => window?.[GLOBAL_SYMBOL]?.reinitialize(), [isLoaded]);
    const forEach = useCallback(
        (callback: HTMLControllerForEachCallback) => window?.[GLOBAL_SYMBOL]?.forEach(callback),
        [isLoaded],
    );

    return {
        reinitialize,
        forEach,
    };
}
