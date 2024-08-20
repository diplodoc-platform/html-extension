type TDisposeCallback = () => void;

const call = (cb: TDisposeCallback) => cb();

export interface IDisposable {
    dispose(): void;
}

export class Disposable implements IDisposable {
    dispose = Object.assign(
        function (this: Disposable) {
            this.dispose.targets.forEach(call);
        },
        {
            add: (target: TDisposeCallback) => {
                this.dispose.targets.add(target);
            },

            targets: new Set<TDisposeCallback>(),
        },
    );
}
