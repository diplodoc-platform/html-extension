import {
    BuilderConfig,
    CallHandler,
    ExposedCallDescriptor,
    PublishableDescriptor,
} from './internalDefs';

export type OptionalUnsubscribe = (() => void) | undefined;
export type ListenerCallback<EventType> = (evt: EventType) => void;
export type EventSourceSubscribe<EventType> = (
    listener: ListenerCallback<EventType>,
) => OptionalUnsubscribe;

export type APIPublisherBuilder<
    ExposedCallDescriptorsUnion extends ExposedCallDescriptor,
    PublishablesUnion extends PublishableDescriptor,
> = {
    call: <CallType extends string, CallArgs, CallResponse>(
        callType: CallType,
        handler: CallHandler<CallArgs, CallResponse>,
    ) => APIPublisherBuilder<
        [CallType, CallArgs, CallResponse] | ExposedCallDescriptorsUnion,
        PublishablesUnion
    >;
    eventSource: <PubType extends string, PubContent>(
        type: PubType,
        eventSourceSubscriptionGetter: EventSourceSubscribe<PubContent>,
    ) => APIPublisherBuilder<
        ExposedCallDescriptorsUnion,
        [PubType, PubContent] | PublishablesUnion
    >;
    build: () => BuilderConfig;
};

export type APIPublisherBlueprint<
    ResultingExposedCallDescriptorsUnion extends ExposedCallDescriptor = never,
    ResultingPublishablesUnion extends PublishableDescriptor = never,
> = (
    builder: APIPublisherBuilder<never, never>,
) => APIPublisherBuilder<ResultingExposedCallDescriptorsUnion, ResultingPublishablesUnion>;

export type InferExposedAPIFromBlueprint<Blueprint> =
    Blueprint extends APIPublisherBlueprint<infer C, infer P>
        ? {
              __calls: C;
              __pubs: P;
          }
        : never;
