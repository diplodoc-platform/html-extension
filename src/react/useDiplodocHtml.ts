import {useEffect, useState} from 'react';
import {EmbeddedContentRootController} from '../runtime/EmbeddedContentRootController';
import {ScriptStore, getScriptStore} from '../common';

const noop = () => {};

function useController(store: ScriptStore) {
    const [controller, setController] = useState<EmbeddedContentRootController | null>(null);

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

export function useDiplodocEmbeddedContentController(): EmbeddedContentRootController | null {
    const store = getScriptStore();
    const controller = useController(store);

    return controller;
}

export function useDiplodocEmbeddedContent() {
    const controller = useDiplodocEmbeddedContentController();

    useEffect(() => {
        controller?.initialize();

        return controller?.disposeChildren();
    }, [controller]);
}
