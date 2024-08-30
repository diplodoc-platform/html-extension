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

    // This effect is to clean up all traces of potential automatic initialization (which happens
    // on DCL), since not doing this would keep everything that was initialized with the old EmbedsConfig
    // (that is potentially different from default options).
    // Better solution would be to split extension runtimes: one for dynamic SPA-like scenarios,
    // where initializing the embed controllers multiple times during the app's lifecycle might be necessary
    // and one for static content generation, where the initialization is done automatically on DCL.
    useEffect(() => {
        controller?.disposeChildren();
    }, [controller]);

    // Note the deliberate lack of deps. This means that the controllers would get (re)initialized
    // every render. This works fine in Diplodoc client, since every single re-render of the component hosting the runtime
    // generally means a navigation was performed.
    // This is not robust, since extra re-renders would re-initialize all iframes, etc.
    // However, to keep the runtimes more or less consistent (mermaid-extension, for instance, uses the same
    // approach), I kept the reliance on this peculiarity for now.
    useEffect(() => {
        controller?.initialize(embedsConfig);

        return () => controller?.disposeChildren();
    });
}
