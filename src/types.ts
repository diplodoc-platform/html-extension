import {GLOBAL_SYMBOL, QUEUE_SYMBOL} from './constants';
import {ScriptStore} from './common';

export type ControllerCallback<T> = (controller: T) => void;

export type SetConfigArgs = IHTMLIFrameControllerConfig;

export interface IHTMLIFrameControllerConfig {
    classNames?: string[];
    styles?: Record<string, string>;
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
