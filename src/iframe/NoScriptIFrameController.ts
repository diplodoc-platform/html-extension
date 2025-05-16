import debounce from 'lodash.debounce';

import {BaseIFrameController} from './BaseIFrameController';

const DEFAULT_RESIZE_DELAY = 150;

type ResizeListener = (value: number) => void;

export class NoScriptIFrameController extends BaseIFrameController {
    private static observables = new Set<NoScriptIFrameController>();
    private static resizeCheckerActive = false;

    private static checkResize() {
        if (!NoScriptIFrameController.resizeCheckerActive) {
            return;
        }

        if (NoScriptIFrameController.observables.size === 0) {
            NoScriptIFrameController.resizeCheckerActive = false;

            return;
        }

        for (const observable of NoScriptIFrameController.observables) {
            if (document.activeElement === observable.domContainer) {
                observable.updateHeight();
            }
        }

        // rAF has a separate place in the event loop and is called only when
        // the browser is ready to repaint. The browser itself makes sure
        // not to call it for background tabs or frames out of viewport.
        // The size recalculation is only needed along with the display update,
        // so this is the most appropriate place in the event loop.
        requestAnimationFrame(NoScriptIFrameController.checkResize);
    }

    private static startResizeChecker() {
        if (NoScriptIFrameController.resizeCheckerActive) {
            return;
        }

        NoScriptIFrameController.resizeCheckerActive = true;
        NoScriptIFrameController.checkResize();
    }

    private resizeObserver: ResizeObserver | undefined;
    private lastHeight = 0;
    private resizeListener: ResizeListener | undefined;

    // The controller is not useless, as there is a narrower type of argument here.
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(iframe: HTMLIFrameElement) {
        super(iframe);
    }

    setResizeListener(listener: ResizeListener) {
        this.resizeListener = listener;

        NoScriptIFrameController.observables.add(this);
        NoScriptIFrameController.startResizeChecker();

        this.updateHeight();

        const disconnectObserver = this.observeContainerResize();

        return () => {
            NoScriptIFrameController.observables.delete(this);
            disconnectObserver();
        };
    }

    updateHeight() {
        const frameWindow = (this.iframe as HTMLIFrameElement).contentWindow;

        if (!frameWindow || !this.resizeListener) {
            return;
        }

        const height = frameWindow.document.documentElement.getBoundingClientRect().height;

        if (height !== this.lastHeight) {
            this.lastHeight = height;

            this.resizeListener(height);
        }
    }

    private observeContainerResize() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        this.resizeObserver = new ResizeObserver(
            debounce(() => {
                this.updateHeight();
            }, DEFAULT_RESIZE_DELAY),
        );

        this.resizeObserver.observe(this.domContainer);

        return () => {
            this.resizeObserver?.disconnect();
        };
    }
}
