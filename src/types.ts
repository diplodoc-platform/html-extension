import {GLOBAL_SYMBOL, QUEUE_SYMBOL} from './constants';
import {ScriptStore} from './common';

export type ControllerCallback<T> = (controller: T) => void;

export type SetConfigArgs = EmbedsConfig;

export interface EmbedsConfig {
    classNames?: string[];
    styles?: Record<string, string>;
    isolatedSandboxHostURIOverride?: string;
    onload?: (host: HTMLIFrameElement) => (() => void) | void;
}

export type Unsubscribe = () => void;

export type CSSProperties = {
    [property: string]: string | number;
};

export type BaseTarget = '_self' | '_blank' | '_parent' | '_top';

export type StylesObject = {
    [selector: string]: CSSProperties;
};

export type EmbeddingMode = 'shadow' | 'srcdoc' | 'isolated';

declare global {
    interface Window {
        [GLOBAL_SYMBOL]: ScriptStore;
        [QUEUE_SYMBOL]: boolean;
    }
}
