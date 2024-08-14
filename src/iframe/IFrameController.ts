import debounce from 'lodash.debounce';
import {ContentResizeCallback, Unsubscribe} from '../types';
import {updateClassNames, updateStyles} from '../utils/reconcile';

const DEFAULT_RESIZE_DELAY = 150;

export class IFrameController {
    private readonly domContainer: HTMLElement;
    private classNames: string[] = [];
    private resizeObserver: ResizeObserver;
    private styles: Record<string, string> = {};

    private resizeListeners = new Set<ContentResizeCallback>();

    constructor(bodyElement: HTMLElement) {
        this.domContainer = bodyElement;

        this.resizeObserver = new window.ResizeObserver(
            debounce(this.notifyResizeListeners.bind(this), DEFAULT_RESIZE_DELAY),
        );

        this.resizeObserver.observe(this.domContainer);
    }

    destroy() {
        this.resizeObserver.disconnect();
    }

    setClassNames(classNames: string[] | undefined = []) {
        updateClassNames(this.domContainer, classNames, this.classNames);

        // update this._classNames to the new classNames
        this.classNames = classNames;
    }

    setStyles(styles: Record<string, string> | undefined = {}) {
        updateStyles(this.domContainer, styles, this.styles);

        // update this._styles to the new styles
        this.styles = styles;
    }

    replaceHTML(htmlString: string) {
        const fragment = globalThis.document.createRange().createContextualFragment(htmlString);

        this.domContainer.replaceChildren(fragment);
    }

    setBaseTarget(value: string) {
        const baseElement = this.getBaseElement();

        baseElement.setAttribute('target', value);
    }

    onContentResize(callback: ContentResizeCallback): Unsubscribe {
        this.resizeListeners.add(callback);

        return () => this.resizeListeners.delete(callback);
    }

    private notifyResizeListeners() {
        const heightToNotifyOf = this.domContainer.getBoundingClientRect().height;

        this.resizeListeners.forEach((listener) => listener(heightToNotifyOf));
    }

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
