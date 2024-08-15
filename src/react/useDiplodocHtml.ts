import {useEffect, useState} from 'react';
import {EmbeddedContentRootController} from '../runtime/EmbeddedContentRootController';
import {ScriptStore, getScriptStore} from '../common';
import {GLOBAL_SYMBOL} from '../constants';

const noop = () => {};

function useController<T>(store: ScriptStore<T>) {
    const [controller, setController] = useState<T | null>(null);

    useEffect(() => {
        if (store) {
            store.push(setController);

            return () => {
                const index = store.indexOf(setController);
                if (index > -1) {
                    store.splice(index, 1);
                }
            };
        }

        return noop;
    }, []);

    return controller;
}

export function useDiplodocHtml(): EmbeddedContentRootController | null {
    const store = getScriptStore<EmbeddedContentRootController>(GLOBAL_SYMBOL);
    const controller = useController<EmbeddedContentRootController>(store);

    return controller;
}
