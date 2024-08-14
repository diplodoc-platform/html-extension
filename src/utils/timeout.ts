export class TimeoutError extends Error {
    override name = 'TimeoutError';

    constructor() {
        super('Operation timed out');
    }
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const runTimeout = async <R>(ms: number) => {
    const errorWithPreservedStack = new TimeoutError();

    await wait(ms);

    return Promise.reject<R>(errorWithPreservedStack);
};

export const timeout = <R>(promise: Promise<R>, ms: number) =>
    Promise.race([promise, runTimeout<R>(ms)]);

