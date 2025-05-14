import debounce from 'lodash.debounce';

import {BaseIFrameController} from './BaseIFrameController';

const DEFAULT_RESIZE_DELAY = 150;

type Command<T> = T extends (...args: infer A) => infer R
    ? {
          Args: A;
          Result: R;
      }
    : never;

export type Events = {
    resize: (height: number) => void;
};

export type Commands = {
    [K in keyof Omit<IFrameController, 'on'>]: Command<IFrameController[K]>;
};

type EventHandlers = {
    [K in keyof Events]: Set<Events[K]>;
};

export class IFrameController extends BaseIFrameController {
    private resizeObserver: ResizeObserver;
    private eventHandlers: EventHandlers = {
        resize: new Set(),
    };

    constructor(iframe: HTMLIFrameElement | Window) {
        super(iframe);

        this.resizeObserver = new ResizeObserver(
            debounce(this.dispatchResize, DEFAULT_RESIZE_DELAY),
        );

        this.resizeObserver.observe(this.domHtml);

        this.dispose.add(() => this.resizeObserver.disconnect());
    }

    on<E extends keyof Events>(eventName: E, eventHandler: Events[E]) {
        this.eventHandlers[eventName].add(eventHandler);

        return () => this.eventHandlers[eventName].delete(eventHandler);
    }

    private dispatchResize: ResizeObserverCallback = (entries) => {
        for (const entry of entries) {
            this.eventHandlers.resize.forEach((handler) =>
                handler(entry.target.getBoundingClientRect().height),
            );
        }
    };
}
