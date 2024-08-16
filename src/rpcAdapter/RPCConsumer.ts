import type {Commands, Events} from '../iframe';
import {Deferred, timeout} from '../utils';
import {Disposable} from '../runtime/Disposable';
import {
    CallRequestMessage,
    CallResponseMessage,
    CallSuccessMessage,
    IMessageChannel,
    PublicationMessage,
    TypedMessage,
    isMessage,
} from './commonDefs';
import {nanoid} from 'nanoid';

type EventListener<T = unknown> = (eventData: T) => void;

type RPCConsumerOptions = {
    callTimeout?: number;
};

const DEFAULT_CALL_TIMEOUT = 1000;

const isCallResponseMessage = (message: TypedMessage): message is CallResponseMessage =>
    'response' in message || 'reason' in message;

const isCallSuccessMessage = (message: CallResponseMessage): message is CallSuccessMessage =>
    'response' in message;

const isEventMessage = (message: TypedMessage): message is PublicationMessage =>
    'content' in message;

export class RPCConsumer extends Disposable {
    private readonly messageChannel: IMessageChannel;
    private readonly calls = new Map<string, Deferred<unknown>>();
    private readonly events = new Map<keyof Events, Set<EventListener>>();

    private readonly callTimeout: number;

    constructor(
        messageChannel: IMessageChannel,
        {callTimeout = DEFAULT_CALL_TIMEOUT}: RPCConsumerOptions = {},
    ) {
        super();

        this.messageChannel = messageChannel;
        this.callTimeout = callTimeout;

        this.messageChannel.onIncomingMessage((message) => this.processIncomingMessage(message));

        this.dispose.add(this.messageChannel.close);
    }

    start() {
        return this.messageChannel.open();
    }

    on<E extends keyof Events>(eventName: E, handler: Events[E]) {
        const handlers = this.events.get(eventName) || new Set();

        handlers.add(handler as EventListener);
        this.events.set(eventName, handlers);

        return () => handlers.delete(handler as EventListener);
    }

    async dispatchCall<C extends keyof Commands>(
        commandName: C,
        ...args: Commands[C]['Args']
    ): Promise<Commands[C]['Result']> {
        const callId = nanoid();
        const message: CallRequestMessage = {
            type: commandName,
            args,
            callId,
        };

        return timeout(
            this.messageChannel.sendMessage(message).then(() => {
                const deferred = new Deferred<unknown>();

                this.calls.set(callId, deferred);

                return deferred.promise;
            }),
            this.callTimeout,
        ).finally(() => this.calls.delete(callId)) as Promise<Commands[C]['Result']>;
    }

    private routeCallResponse(message: CallResponseMessage) {
        const deferred = this.calls.get(message.callId);

        if (!deferred) {
            throw new Error(`Call with id=${message.callId} is not in progress`);
        }

        if (isCallSuccessMessage(message)) {
            deferred.resolve(message.response);
        } else {
            deferred.reject(message.reason);
        }
    }

    private routeEvent({type, content}: PublicationMessage) {
        const handlers = this.events.get(type as keyof Events);

        handlers?.forEach((handler) => handler(content));
    }

    private processIncomingMessage(message: unknown) {
        if (!isMessage(message)) {
            throw new Error('Incoming message failed check for protocol message shape');
        }

        if (isEventMessage(message)) {
            return this.routeEvent(message);
        }

        if (isCallResponseMessage(message)) {
            return this.routeCallResponse(message);
        }

        throw new Error('Message could not be processed');
    }
}
