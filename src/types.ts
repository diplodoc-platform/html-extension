import {GLOBAL_SYMBOL} from './constants';
import {ScriptStore} from './common';

export type ControllerCallback<T> = (controller: T) => void;

export type ForEachCallbackArgs = ControllerCallback<IHtmlIFrameController>;
export type SetConfigArgs = IHTMLIFrameControllerConfig;

export interface IHtmlController {
    destroy(): void;
    forEach(callback: ForEachCallbackArgs): void;
    readonly blocks: IHtmlIFrameController[];
    reinitialize(): void;
    setConfig(config: SetConfigArgs): void;
}

export interface IHTMLIFrameControllerConfig {
    classNames?: string[];
    styles?: Record<string, string>;
}

export type ContentResizeCallback = (newHeight: number) => void;
export type Unsubscribe = () => void;

export interface IHtmlIFrameController {
    setClassNames(classNames: string[]): void;
    setStyles(styles: Record<string, string>): void;
    onContentResize: (callback: ContentResizeCallback) => Unsubscribe;
    destroy(): void;
}

declare global {
    interface Window {
        [GLOBAL_SYMBOL]: ScriptStore<IHtmlController>;
    }
}
