import {
    CallRejectionMessage,
    CallRequestMessage,
    CallSuccessMessage,
    IMessageChannel,
    PublicationMessage,
    isCallRequestMessage,
    isMessage,
} from '../commonDefs';
import {makeBuilderInternal} from './builder';
import {APIPublisherBlueprint, OptionalUnsubscribe} from './defs';
import {BuilderConfig} from './internalDefs';

export class APIPublisher {
    static fromBlueprint(
        messageChannel: IMessageChannel,
        blueprint: APIPublisherBlueprint<never, never>,
    ) {
        const builder = makeBuilderInternal<never, never>({
            messageChannel,
            registeredCalls: {},
            eventSources: [],
        });

        const config = blueprint(builder).build();

        return new APIPublisher(config);
    }

    private readonly messageChannel: IMessageChannel;
    private readonly routingMap: BuilderConfig['registeredCalls'];
    private readonly eventSourceSubscriptionDisposers: OptionalUnsubscribe[] = [];

    private constructor({messageChannel, registeredCalls, eventSources}: BuilderConfig) {
        this.messageChannel = messageChannel;
        this.routingMap = registeredCalls;

        this.messageChannel.onIncomingMessage((message) => {
            if (isMessage(message) && isCallRequestMessage(message)) {
                this.processCall(message);
            }
        });

        this.eventSourceSubscriptionDisposers = eventSources.map(
            ({eventName, subscriptionGetter}) =>
                subscriptionGetter((event) => this.eventNotify(eventName, event)),
        );
    }

    start() {
        return this.messageChannel.open();
    }

    destroy() {
        this.messageChannel.close();
        this.eventSourceSubscriptionDisposers.forEach((maybeUnsub) => maybeUnsub?.());
    }

    private async eventNotify(type: string, content: unknown): Promise<void> {
        const publicationMessage: PublicationMessage = {
            type,
            content,
        };

        return this.messageChannel.sendMessage(publicationMessage);
    }

    private async doCall({type, callId, args}: CallRequestMessage) {
        try {
            const response = await this.routingMap[type](args);

            const message: CallSuccessMessage = {
                type,
                callId,
                response,
            };

            return message;
        } catch (e) {
            if (e instanceof Error) {
                const message: CallRejectionMessage = {
                    type,
                    callId,
                    reason: e,
                };

                return message;
            }

            throw new TypeError(
                `Call handler for type \`${type}\` threw something that's not an instance of Error: ${String(e)}`,
            );
        }
    }

    private async processCall(message: CallRequestMessage) {
        try {
            const outgoingMessage = await this.doCall(message);

            this.messageChannel.sendMessage(outgoingMessage);
        } catch (e) {
            const originalError = e instanceof Error ? e.message : String(e);

            throw new Error(
                `Something went wrong while trying to process a call: ${originalError}`,
            );
        }
    }
}
