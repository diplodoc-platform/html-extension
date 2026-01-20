import type {EmbeddedContentRootController} from './runtime/EmbeddedContentRootController';

import {GLOBAL_SYMBOL, QUEUE_SYMBOL} from './constants';

type ControllerLoadedCallback = (controller: EmbeddedContentRootController) => void;
export type ScriptStore = ControllerLoadedCallback[] | null;

export interface CreateLoadQueueArgs {
    store: ScriptStore;
    createController: () => EmbeddedContentRootController;
    isQueueCreated?: boolean;
    onQueueCreated?: (created: boolean) => void;
}

export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export const getScriptStore = (): ScriptStore => {
    if (isBrowser()) {
        window[GLOBAL_SYMBOL] = window[GLOBAL_SYMBOL] ?? [];

        return window[GLOBAL_SYMBOL];
    }

    return null;
};

export const getQueueStore = () => {
    if (isBrowser()) {
        window[QUEUE_SYMBOL] = window[QUEUE_SYMBOL] || false;

        return window[QUEUE_SYMBOL];
    }

    return false;
};

export const handleQueueCreated = (created: boolean) => {
    window[QUEUE_SYMBOL] = created;
};

export const createLoadQueue = ({
    store,
    createController,
    isQueueCreated = getQueueStore(),
    onQueueCreated = handleQueueCreated,
}: CreateLoadQueueArgs) => {
    if (!store || isQueueCreated) {
        return;
    }
    onQueueCreated(true);

    const controller = createController();

    const queue = store.splice(0, store.length);

    store.push = function (...args) {
        args.forEach((callback) => {
            queue.push(callback);
            unqueue();
        });

        return queue.length;
    };

    let processing = false;

    async function unqueue() {
        if (!processing) {
            return next();
        }

        return undefined;
    }

    async function next(): Promise<void> {
        processing = true;

        const callback = queue.shift();
        if (callback) {
            callback(controller);

            return next();
        }

        processing = false;

        return undefined;
    }

    unqueue();
};
