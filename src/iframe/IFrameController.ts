import debounce from 'lodash.debounce';
import {updateClassNames, updateStyles} from '../utils';

const DEFAULT_RESIZE_DELAY = 150;

type Command<T extends (...args: any[]) => any> = {
    Args: Parameters<T>[0];
    Result: ReturnType<T>;
};

export type Events = {
    resize: (rect: DOMRect) => void;
};

export type Commands = {
    [K in keyof Omit<IFrameController, 'on'>]: Command<IFrameController[K]>;
};

export class IFrameController {
    private readonly domContainer: HTMLElement;
    private classNames: string[] = [];
    private resizeObserver: ResizeObserver;
    private styles: Record<string, string> = {};
    private events: Record<keyof Events, Set<Events[keyof Events]>> = {
        resize: new Set(),
    };

    constructor(bodyElement: HTMLElement) {
        this.domContainer = bodyElement;

        this.resizeObserver = new ResizeObserver(
            debounce(this.dispatchResize, DEFAULT_RESIZE_DELAY),
        );

        this.resizeObserver.observe(this.domContainer);
    }

    setClassNames = (classNames: string[] | undefined = []) => {
        updateClassNames(this.domContainer, classNames, this.classNames);

        // update this._classNames to the new classNames
        this.classNames = classNames;
    };

    setStyles = (styles: Record<string, string> | undefined = {}) => {
        updateStyles(this.domContainer, styles, this.styles);

        // update this._styles to the new styles
        this.styles = styles;
    };

    replaceHTML = (htmlString: string) => {
        const fragment = globalThis.document.createRange().createContextualFragment(htmlString);

        this.domContainer.replaceChildren(fragment);

        // TODO: should we reinitialize Observer?
    };

    setBaseTarget = (value: string) => {
        const baseElement = this.getBaseElement();

        baseElement.setAttribute('target', value);
    };

    on<E extends keyof Events>(eventName: E, eventHandler: Events[E]) {
        this.events[eventName].add(eventHandler);

        return () => this.events[eventName].delete(eventHandler);
    }

    private dispatchResize: ResizeObserverCallback = (entries) => {
        for (const entry of entries) {
            for (const handler of this.events?.resize) {
                handler(entry.contentRect);
            }
        }
    };

    private getBaseElement() {
        const head = globalThis.document.head;

        const maybeExistingBase = head.querySelector('base');

        if (!maybeExistingBase) {
            const newBase = globalThis.document.createElement('base');

            head.appendChild(newBase);

            return newBase;
        }

        return maybeExistingBase;
    }
}
