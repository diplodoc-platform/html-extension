import {GLOBAL_SYMBOL} from './constants';
import {ScriptStore} from './common';

export type ControllerCallback<T> = (controller: T) => void;

export interface IHtmlController {
    readonly blocks: IHtmlIFrameController[];
    forEach(callback: ControllerCallback<IHtmlIFrameController>): void;
    reinitialize(): void;
}

export interface IHTMLIFrameElementConfig {
    resizeDelay?: number;
    resizePadding?: number;
}

export interface IHtmlIFrameController {
    readonly block: HTMLIFrameElement;
    execute(callback: ControllerCallback<IHtmlIFrameController>): void;
    resize(): void;
    setStyles(styles: Record<string, string>): void;
}

declare global {
    interface Window {
        [GLOBAL_SYMBOL]: ScriptStore<IHtmlController>;
    }
}
