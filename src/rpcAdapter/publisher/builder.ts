import {APIPublisherBuilder, EventSourceSubscribe} from './defs';
import {
    BuilderConfig,
    CallHandler,
    ExposedCallDescriptor,
    PublishableDescriptor,
} from './internalDefs';

export const makeBuilderInternal = <
    ExposedCallDescriptorsUnion extends ExposedCallDescriptor,
    PublishablesUnion extends PublishableDescriptor,
>(
    config: BuilderConfig,
): APIPublisherBuilder<ExposedCallDescriptorsUnion, PublishablesUnion> => ({
    call: <const CallType extends string, CallArgs, CallResponse>(
        callType: CallType,
        handler: CallHandler<CallArgs, CallResponse>,
    ) =>
        makeBuilderInternal<
            [CallType, CallArgs, CallResponse] | ExposedCallDescriptorsUnion,
            PublishablesUnion
        >({
            ...config,
            registeredCalls: {...config.registeredCalls, [callType]: handler},
        }),
    eventSource: <const PubType extends string, PubContent>(
        eventName: PubType,
        subscriptionGetter: EventSourceSubscribe<PubContent>,
    ) =>
        makeBuilderInternal<ExposedCallDescriptorsUnion, [PubType, PubContent] | PublishablesUnion>(
            {
                ...config,
                eventSources: [
                    ...config.eventSources,
                    {
                        eventName,
                        subscriptionGetter,
                    },
                ],
            },
        ),
    build: () => config,
});
