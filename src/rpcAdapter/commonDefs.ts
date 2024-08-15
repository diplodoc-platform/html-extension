import type {Unsubscribe} from '../types';

export type TypedMessage = {
    type: string;
};

export type RPCMessageContract = {
    callId: string;
};

export type CallRequestMessage = TypedMessage &
    RPCMessageContract & {
        args: unknown;
    };

export type CallSuccessMessage = TypedMessage &
    RPCMessageContract & {
        response: unknown;
    };
export type CallRejectionMessage = TypedMessage &
    RPCMessageContract & {
        reason: Error;
    };
export type CallResponseMessage = CallSuccessMessage | CallRejectionMessage;

export type PublicationMessage = TypedMessage & {
    content: unknown;
};

export type HandshakeServiceMessage = {
    handshake: 'initiator' | 'ack';
};

export type IMessageChannel = {
    open: () => Promise<void>;
    close: () => Promise<void>;
    isUpstreamHealthy: boolean;
    onIncomingMessage: (handler: (message: unknown) => void) => Unsubscribe;
    sendMessage: (message: unknown) => Promise<void>;
};

export const isMessage = (maybeMessage: unknown): maybeMessage is TypedMessage =>
    typeof maybeMessage === 'object' && maybeMessage !== null && 'type' in maybeMessage;
