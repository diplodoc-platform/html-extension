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

type Unsub = () => void;

export type IMessageChannel = {
    open: () => Promise<void>;
    close: () => Promise<void>;
    isUpstreamHealthy: boolean;
    onIncomingMessage: (handler: (message: unknown) => void) => Unsub;
    sendMessage: (message: unknown) => Promise<void>;
};

export const isMessage = (maybeMessage: unknown): maybeMessage is TypedMessage =>
    typeof maybeMessage === 'object' && maybeMessage !== null && 'type' in maybeMessage;

export const isCallRequestMessage = (message: TypedMessage): message is CallRequestMessage =>
    'callId' in message && 'args' in message;

export const isCallResponseMessage = (message: TypedMessage): message is CallResponseMessage =>
    'response' in message || 'reason' in message;

export const isCallSuccessMessage = (message: CallResponseMessage): message is CallSuccessMessage =>
    'response' in message;

export const isEventMessage = (message: TypedMessage): message is PublicationMessage =>
    'content' in message;

export const isHandshakeServiceMessage = (
    maybeMessage: unknown,
): maybeMessage is HandshakeServiceMessage =>
    typeof maybeMessage === 'object' && maybeMessage !== null && 'handshake' in maybeMessage;
