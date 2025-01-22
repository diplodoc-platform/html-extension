import debounce from 'lodash.debounce';

import {Disposable} from '../utils';

const DEFAULT_RESIZE_DELAY = 150;

type ResizeListener = (value: number) => void;

export class NoScriptIFrameController extends Disposable {
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

        requestAnimationFrame(NoScriptIFrameController.checkResize);
    }

    private static startResizeChecker() {
        if (NoScriptIFrameController.resizeCheckerActive) {
            return;
        }

        NoScriptIFrameController.resizeCheckerActive = true;
        NoScriptIFrameController.checkResize();
    }

    private domContainer: HTMLIFrameElement;
    private resizeObserver: ResizeObserver | undefined;
    private lastHeight = 0;
    private resizeListener: ResizeListener | undefined;

    constructor(frame: HTMLIFrameElement) {
        super();

        this.domContainer = frame;
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
        const frameWindow = this.domContainer.contentWindow;

        if (!frameWindow || !this.resizeListener) {
            return;
        }

        const height = frameWindow.document.body.clientHeight;

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
