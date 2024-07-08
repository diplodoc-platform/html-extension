import {useEffect, useState} from 'react';

type Callback<T> = (controller: T) => void;

export type Store<T> = Callback<T>[];

export interface CreateLoadQueueArgs<T> {
    store: Store<T>;
    controller: T;
}

export interface GetScriptStoreArgs {
    readonly prefix: string;
}

export const getScriptStore = <T = any>({prefix}: GetScriptStoreArgs): Store<T> => {
    try {
        if (!(window as any)[prefix]) {
            (window as any)[prefix] = [];
            (window as any)[prefix]._store = new Proxy((window as any)[prefix], {});
        }
        return (window as any)[prefix]._store;
    } catch {
        throw new Error('window is not defined');
    }
};

export const createLoadQueue = <T = any>({store, controller}: CreateLoadQueueArgs<T>) => {
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

export function useController<T>(store: Store<T>) {
    const [controller, setController] = useState<T | null>(null);

    useEffect(() => {
        store.push(setController);

        return () => {
            const index = store.indexOf(setController);
            if (index > -1) {
                store.splice(index, 1);
            }
        };
    }, []);

    return controller;
}
