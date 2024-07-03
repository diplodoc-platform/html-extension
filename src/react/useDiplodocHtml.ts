import {useCallback, useEffect, useRef, useState} from 'react';
import {GLOBAL_SYMBOL, HTMLControllerForEachCallback} from '../common';

interface CheckForGlobalSymbolArgs {
    intervalId?: ReturnType<typeof setInterval>;
    setIsLoaded: (isLoaded: boolean) => void;
}

function checkForGlobalSymbol({intervalId, setIsLoaded}: CheckForGlobalSymbolArgs): void {
    if (window[GLOBAL_SYMBOL]) {
        setIsLoaded(true);
        return;
    }
    intervalId = setInterval(() => {
        if (window[GLOBAL_SYMBOL]) {
            setIsLoaded(true);
            clearInterval(intervalId);
        }
    }, 100);
}

export function useDiplodocHtml() {
    const intervalId = useRef<ReturnType<typeof setInterval>>();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        checkForGlobalSymbol({
            intervalId: intervalId.current,
            setIsLoaded: (loaded: boolean) => setIsLoaded(loaded),
        });

        return () => {
            clearInterval(intervalId.current);
        };
    }, []);

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
