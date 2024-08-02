import {IMessageChannel} from '../commonDefs';
import {EventSourceSubscribe} from './defs';

export type ExposedCallDescriptor<
    Type extends string = string,
    Args = unknown,
    Response = unknown,
> = [Type, Args, Response];
export type PublishableDescriptor<Type extends string = string, Content = unknown> = [
    Type,
    Content,
];

export type Awaitable<T> = T | Promise<T>;

export type CallHandler<Args, Response> = (args: Args) => Awaitable<Response>;

export type EventSourceDescriptor = {
    eventName: string;
    subscriptionGetter: EventSourceSubscribe<unknown>;
};

export type BuilderConfig = {
    messageChannel: IMessageChannel;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registeredCalls: Record<string, CallHandler<any, unknown>>;
    eventSources: EventSourceDescriptor[];
};
