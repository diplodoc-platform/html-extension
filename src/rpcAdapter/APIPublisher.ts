import type {Commands, Events} from '../iframe';
import type {
    CallRejectionMessage,
    CallRequestMessage,
    CallSuccessMessage,
    IMessageChannel,
    PublicationMessage,
    TypedMessage,
} from './commonDefs';

import {Disposable} from '../utils';

import {isMessage} from './commonDefs';

type Handler<T extends Commands[keyof Commands] = Commands[keyof Commands]> = (
    ...args: T['Args']
) => Promise<T['Result']> | T['Result'];

type UntypedHandler = (...args: unknown[]) => unknown;

const isCallRequestMessage = (message: TypedMessage): message is CallRequestMessage =>
    'callId' in message && 'args' in message;

export class APIPublisher extends Disposable {
    private readonly messageChannel: IMessageChannel;
    private readonly commands = new Map<keyof Commands, UntypedHandler>();

    constructor(messageChannel: IMessageChannel) {
        super();

        this.messageChannel = messageChannel;

        this.messageChannel.onIncomingMessage((message) => {
            if (isMessage(message) && isCallRequestMessage(message)) {
                this.processCall(message);
            }
        });

        this.dispose.add(() => this.messageChannel.close());
    }

    start() {
        return this.messageChannel.open();
    }

    onCommand<C extends keyof Commands>(commandName: C, handler: Handler<Commands[C]>) {
        this.commands.set(commandName, handler as UntypedHandler);

        return this;
    }

    async dispatchEvent(type: keyof Events, content: unknown): Promise<void> {
        const publicationMessage: PublicationMessage = {
            type,
            content,
        };

        return this.messageChannel.sendMessage(publicationMessage);
    }

    private async doCall({type, callId, args}: CallRequestMessage) {
        try {
            const handler = this.commands.get(type as keyof Commands) as UntypedHandler;
            const response = await handler(...args);

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
