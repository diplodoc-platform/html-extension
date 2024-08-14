export type TaskQueueOptions = {
    startImmediately?: boolean;
};

export class TaskQueue {
    private queueHead: Promise<unknown>;

    constructor(headState: Promise<void> = Promise.resolve()) {
        this.queueHead = headState;
    }

    run<R>(task: () => Promise<R>): Promise<R> {
        const appendedChain = this.queueHead.then(task, task);

        this.queueHead = appendedChain;

        return appendedChain;
    }
}

type PromiseCallbackPair<T> = {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (thrown: Error) => void;
};

export class Deferred<T> extends Promise<T> {
    private didSettle = false;
    private callbacks: PromiseCallbackPair<T> = {
        resolve: () => {},
        reject: () => {},
    };

    constructor() {
        super((resolve, reject) => {
            this.callbacks = {resolve, reject};
        });
    }

    resolve(value: T | PromiseLike<T>) {
        this.trySettle();
        this.callbacks.resolve(value);
    }

    reject(thrown: Error) {
        this.trySettle();
        this.callbacks.reject(thrown);
    }

    get isSettled() {
        return this.didSettle;
    }

    private trySettle() {
        if (this.didSettle) {
            throw new Error('Deferred has already been settled.');
        }

        this.didSettle = true;
    }
}

export const queueFromFuse = () => {
    const fuse = new Deferred<void>();
    const queue = new TaskQueue(fuse);

    return [queue, fuse] as const;
};
