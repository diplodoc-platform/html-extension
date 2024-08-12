import {IMessageChannel, PublicationMessage, isEventMessage, isMessage} from '../commonDefs';

type EventListener<T = unknown> = (eventData: T) => void;

const getOrIninitialize = <K, V>(map: Map<K, V>, key: K, initializer: () => V): V => {
    const existingValue = map.get(key);

    if (typeof existingValue === 'undefined') {
        const initialized = initializer();

        map.set(key, initialized);

        return initialized;
    }

    return existingValue;
};

export class RPCConsumer {
    private readonly eventListenerRouting = new Map<string, Set<EventListener>>();
    private readonly messageChannel: IMessageChannel;

    constructor(messageChannel: IMessageChannel) {
        this.messageChannel = messageChannel;

        this.messageChannel.onIncomingMessage((message) => this.processIncomingMessage(message));
    }

    start() {
        this.messageChannel.open();
    }

    destroy() {
        this.messageChannel.close();
    }

    on(eventName: string, listener: EventListener) {
        const routesForThisEvent = getOrIninitialize(
            this.eventListenerRouting,
            eventName,
            () => new Set<EventListener>(),
        );

        routesForThisEvent.add(listener);

        return () => routesForThisEvent.delete(listener);
    }

    // dispatchCall(callType: string, callBody: unknown) {}

    private routeEvent({type, content}: PublicationMessage) {
        const routesForThisEvent = this.eventListenerRouting.get(type);

        routesForThisEvent?.forEach((listener) => listener(content));
    }

    private processIncomingMessage(message: unknown) {
        if (!isMessage(message)) {
            throw new Error('Incoming message failed check for protocol message shape');
        }

        if (isEventMessage(message)) {
            return this.routeEvent(message);
        }

        return undefined;
    }
}
