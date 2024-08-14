import {Deferred} from '../../utils/PromiseQueue';
import {timeout} from '../../utils/timeout';
import {
    CallRequestMessage,
    CallResponseMessage,
    IMessageChannel,
    PublicationMessage,
    isCallResponseMessage,
    isCallSuccessMessage,
    isEventMessage,
    isMessage,
} from '../commonDefs';
import {nanoid} from 'nanoid';
import {ExposedAPISchema} from '../publisher';
import {ExposedCallDescriptor, PublishableDescriptor} from '../publisher/internalDefs';

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

const throwexpr = (e: Error): never => {
    throw e;
};

type RPCConsumerOptions = {
    callTimeout?: number;
};

const DEFAULT_CALL_TIMEOUT = 1000;

type GuardNever<T, ResolvedType, Fallback> = [T] extends [never] ? Fallback : ResolvedType;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractEventTypes<Schema extends ExposedAPISchema<any, any>> = GuardNever<
    Schema,
    Schema['__events'][0],
    string
>;
type ExtractEventPayload<
    EventDescUnion extends PublishableDescriptor,
    EventType extends string,
> = GuardNever<
    EventDescUnion,
    EventDescUnion extends [EventType, infer Payload] ? Payload : never,
    unknown
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractCallTypes<Schema extends ExposedAPISchema<any, any>> = GuardNever<
    Schema,
    Schema['__calls'][0],
    string
>;
type ExtractCallArgs<
    CallDescUnion extends ExposedCallDescriptor,
    CallType extends string,
> = GuardNever<
    CallDescUnion,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CallDescUnion extends [CallType, infer Args, any] ? Args : never,
    unknown
>;
type ExtractCallResponse<
    CallDescUnion extends ExposedCallDescriptor,
    CallType extends string,
> = GuardNever<
    CallDescUnion,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CallDescUnion extends [CallType, any, infer Response] ? Response : never,
    unknown
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RPCConsumer<Schema extends ExposedAPISchema<any, any> = never> {
    private readonly messageChannel: IMessageChannel;
    private readonly eventListenerRouting = new Map<string, Set<EventListener>>();
    private readonly callsInProgress = new Map<string, Deferred<unknown>>();

    private readonly callTimeout: number;

    constructor(
        messageChannel: IMessageChannel,
        {callTimeout = DEFAULT_CALL_TIMEOUT}: RPCConsumerOptions = {},
    ) {
        this.messageChannel = messageChannel;
        this.callTimeout = callTimeout;

        this.messageChannel.onIncomingMessage((message) => this.processIncomingMessage(message));
    }

    start() {
        return this.messageChannel.open();
    }

    destroy() {
        this.messageChannel.close();
    }

    on<T extends ExtractEventTypes<Schema>>(
        eventName: T,
        listener: NoInfer<EventListener<ExtractEventPayload<Schema['__events'], T>>>,
    ) {
        const routesForThisEvent = getOrIninitialize(
            this.eventListenerRouting,
            eventName,
            () => new Set<EventListener>(),
        );

        routesForThisEvent.add(listener as EventListener<unknown>);

        return () => routesForThisEvent.delete(listener as EventListener<unknown>);
    }

    async dispatchCall<T extends ExtractCallTypes<Schema>>(
        type: T,
        args: NoInfer<ExtractCallArgs<Schema['__calls'], T>>,
    ): Promise<ExtractCallResponse<Schema['__calls'], T>> {
        const callId = nanoid();
        const message: CallRequestMessage = {
            type,
            args,
            callId,
        };

        return timeout(
            this.messageChannel
                .sendMessage(message)
                .then(() =>
                    getOrIninitialize(this.callsInProgress, callId, () => new Deferred<unknown>()),
                ),
            this.callTimeout,
        ).finally(() => this.callsInProgress.delete(callId)) as Promise<
            ExtractCallResponse<Schema['__calls'], T>
        >;
    }

    private routeCallResponse(message: CallResponseMessage) {
        const deferred =
            this.callsInProgress.get(message.callId) ??
            throwexpr(new Error(`Call with id=${message.callId} is not in progress`));

        if (isCallSuccessMessage(message)) {
            deferred.resolve(message.response);
        } else {
            deferred.reject(message.reason);
        }
    }

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

        if (isCallResponseMessage(message)) {
            return this.routeCallResponse(message);
        }

        throw new Error('Message could not be processed');
    }
}
