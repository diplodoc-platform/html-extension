import {useEffect, useState} from 'react';
import {EmbeddedContentRootController} from '../runtime/EmbeddedContentRootController';
import {ScriptStore, getScriptStore} from '../common';
import {EmbedsConfig} from '../types';

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

export function useDiplodocEmbeddedContent(embedsConfig?: EmbedsConfig) {
    const controller = useDiplodocEmbeddedContentController();

    useEffect(() => {
        controller?.initialize(embedsConfig);

        return controller?.disposeChildren();
    }, [controller, embedsConfig]);
}
