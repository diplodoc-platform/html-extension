import {IMessageChannel} from './commonDefs';

export class PostMessageChannel implements IMessageChannel {
    private readonly listeners = new Set<(data: unknown) => void>();
    private readonly target: MessageEventSource;

    constructor(target: MessageEventSource) {
        this.target = target;

        this.target.addEventListener('message', this.handleIncomingMessage as EventListener);
    }

    sendMessage(message: unknown) {
        this.target.postMessage(message);

        return Promise.resolve();
    }

    onIncomingMessage(handler: (message: unknown) => void) {
        this.listeners.add(handler);

        return () => this.listeners.delete(handler);
    }

    close() {
        this.target.removeEventListener('message', this.handleIncomingMessage as EventListener);
    }

    private handleIncomingMessage = (e: MessageEvent) => {
        this.listeners.forEach((listener) => listener(e));
    };
}
