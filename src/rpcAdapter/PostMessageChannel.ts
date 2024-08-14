import {Deferred, TaskQueue, queueFromFuse} from '../utils/PromiseQueue';
import {HandshakeServiceMessage, IMessageChannel, isHandshakeServiceMessage} from './commonDefs';

export class PostMessageChannel implements IMessageChannel {
    private readonly listeners = new Set<(data: unknown) => void>();
    private readonly target: MessageEventSource;

    private readonly sendQueue: TaskQueue;
    private readonly handshakeFuse: Deferred<void>;

    constructor(target: MessageEventSource) {
        const [queue, handshakeFuse] = queueFromFuse();

        this.target = target;
        this.sendQueue = queue;
        this.handshakeFuse = handshakeFuse;

        globalThis.addEventListener('message', this.handleIncomingMessage as EventListener);
    }

    open() {
        this.sendMessageRaw({handshake: 'initiator'} satisfies HandshakeServiceMessage);

        return this.handshakeFuse.promise;
    }

    sendMessage(message: unknown) {
        return this.sendQueue.run(() => {
            this.sendMessageRaw(message);

            return Promise.resolve();
        });
    }

    get isUpstreamHealthy() {
        return this.handshakeFuse.isSettled;
    }

    onIncomingMessage(handler: (message: unknown) => void) {
        this.listeners.add(handler);

        return () => this.listeners.delete(handler);
    }

    close() {
        globalThis.removeEventListener('message', this.handleIncomingMessage as EventListener);

        return Promise.resolve();
    }

    private handleIncomingMessage = (e: MessageEvent) => {
        if (e.source !== this.target) {
            return;
        }

        const incomingData = e.data;

        if (isHandshakeServiceMessage(incomingData)) {
            this.handleHandshake(incomingData);

            return;
        }

        this.listeners.forEach((listener) => listener(e.data));
    };

    private sendMessageRaw(message: unknown) {
        this.target.postMessage(message, {
            targetOrigin: '*',
        });
    }

    private handleHandshake(serviceMessage: HandshakeServiceMessage) {
        this.handshakeFuse.resolve(undefined);

        if (serviceMessage.handshake === 'initiator') {
            this.sendMessageRaw({handshake: 'ack'} satisfies HandshakeServiceMessage);
        }
    }
}
