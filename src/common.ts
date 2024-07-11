import {useEffect, useState} from 'react';

type Callback<T> = (controller: T) => void;

export const QUEUE_SYMBOL: unique symbol = Symbol.for('queue');

export type ScriptStore<T> = Callback<T>[] | null;

export interface CreateLoadQueueArgs<T> {
    store: ScriptStore<T>;
    createController: () => T;
    isQueueCreated?: boolean;
    onQueueCreated?: (created: boolean) => void;
}

export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export const getScriptStore = <T = any>(key: symbol): ScriptStore<T> => {
    if (isBrowser()) {
        (window as any)[key] = (window as any)[key] || [];
        return (window as any)[key];
    }

    return null;
};

export const getQueueStore = () => {
    if (isBrowser()) {
        (window as any)[QUEUE_SYMBOL] = (window as any)[QUEUE_SYMBOL] || false;
        return (window as any)[QUEUE_SYMBOL];
    }

    return null;
};

export const handleQueueCreated = (created: boolean) => {
    (window as any)[QUEUE_SYMBOL] = created;
};

export const createLoadQueue = <T = any>({
    store,
    createController,
    isQueueCreated = getQueueStore(),
    onQueueCreated = handleQueueCreated,
}: CreateLoadQueueArgs<T>) => {
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

    function unqueue() {
        if (!processing) {
            next();
        }
    }

    async function next(): Promise<void> {
        processing = true;

        const callback = queue.shift();
        if (callback) {
            await callback(controller);
            return next();
        }

        processing = false;
    }

    unqueue();
};

const noop = () => {};

export function useController<T>(store: ScriptStore<T>) {
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
