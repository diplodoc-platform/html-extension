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

type Unsub = () => void;

export type IMessageChannel = {
    onIncomingMessage: (handler: (message: unknown) => void) => Unsub;
    sendMessage: (message: unknown) => Promise<void>;
    close: () => void;
};

export const isMessage = (maybeMessage: unknown): maybeMessage is TypedMessage =>
    typeof maybeMessage === 'object' && maybeMessage !== null && 'type' in maybeMessage;

export const isCallRequestMessage = (message: TypedMessage): message is CallRequestMessage =>
    'callId' in message && 'args' in message;
