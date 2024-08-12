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

export class PromiseFuse {
    readonly promise: Promise<void>;

    private _isBlown = false;
    private readonly resolutionCb: () => void;

    constructor() {
        let resolutionCb = () => {};

        this.promise = new Promise((resolve) => {
            resolutionCb = resolve;
        });

        this.resolutionCb = resolutionCb;
    }

    blowIfNotBlown() {
        if (!this._isBlown) {
            this.resolutionCb();
            this._isBlown = true;
        }
    }

    get isBlown() {
        return this._isBlown;
    }
}

export const queueFromFuse = () => {
    const fuse = new PromiseFuse();
    const queue = new TaskQueue(fuse.promise);

    return [queue, fuse] as const;
};
