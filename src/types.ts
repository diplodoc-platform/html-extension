import {GLOBAL_SYMBOL} from './constants';
import {ScriptStore} from './common';

export type ControllerCallback<T> = (controller: T) => void;

export interface IHtmlController {
    destroy(): void;
    forEach(callback: ControllerCallback<IHtmlIFrameController>): void;
    readonly blocks: IHtmlIFrameController[];
    reinitialize(): void;
    setConfig(config: IHTMLIFrameElementConfig): void;
}

export interface IHTMLIFrameElementConfig {
    resizeDelay?: number;
    resizePadding?: number;
}

export interface IHtmlIFrameController {
    destroy(): void;
    execute(callback: ControllerCallback<IHtmlIFrameController>): void;
    readonly block: HTMLIFrameElement;
    resize(): void;
    setConfig(config: IHTMLIFrameElementConfig): void;
    setStyles(styles: Record<string, string>): void;
}

declare global {
    interface Window {
        [GLOBAL_SYMBOL]: ScriptStore<IHtmlController>;
    }
}
