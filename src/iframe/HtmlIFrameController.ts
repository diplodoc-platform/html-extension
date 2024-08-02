import debounce from 'lodash.debounce';
import {
    ContentResizeCallback,
    IHTMLIFrameControllerConfig,
    IHtmlIFrameController,
    Unsubscribe,
} from '../types';

const DEFAULT_RESIZE_DELAY = 150;

const DEFAULT_CONFIG = {
    classNames: [],
    styles: {},
};

export class HtmlIFrameController implements IHtmlIFrameController {
    private readonly _domContainer: HTMLElement;
    private _classNames: string[] = [];
    private _resizeObserver: ResizeObserver;
    private _styles: Record<string, string> = {};

    private resizeListeners = new Set<ContentResizeCallback>();

    constructor(
        bodyElement: HTMLElement,
        config: IHTMLIFrameControllerConfig = DEFAULT_CONFIG,
    ) {
        const {classNames: initialClassNames, styles: initialStyles} = config;

        this._domContainer = bodyElement;

        this.setClassNames(initialClassNames);
        this.setStyles(initialStyles);

        this._resizeObserver = new window.ResizeObserver(
            debounce(this.notifyResizeListeners, DEFAULT_RESIZE_DELAY),
        );

        this._resizeObserver.observe(this._domContainer);
    }

    destroy() {
        this._resizeObserver.disconnect();
    }

    setClassNames(classNames: string[] | undefined = []) {
        const previousClassNames = this._classNames || [];

        // remove all classes that were in previousClassNames but are not in classNames
        previousClassNames.forEach((className) => {
            if (!classNames.includes(className)) {
                this._domContainer.classList.remove(className);
            }
        });

        // add classes that are in classNames
        classNames.forEach((className) => {
            if (!this._domContainer.classList.contains(className)) {
                this._domContainer.classList.add(className);
            }
        });

        // update this._classNames to the new classNames
        this._classNames = classNames;
    }

    setStyles(styles: Record<string, string> | undefined = {}) {
        const previousStyles = this._styles;

        // remove all styles that are in previousStyles but not in styles
        Object.keys(previousStyles).forEach((property) => {
            if (!Object.prototype.hasOwnProperty.call(styles, property)) {
                this._domContainer.style.removeProperty(property);
            }
        });

        // add or update styles that are in styles
        Object.keys(styles).forEach((property) => {
            this._domContainer.style.setProperty(property, styles[property]);
        });

        // update this._styles to the new styles
        this._styles = styles;
    }

    onContentResize(callback: ContentResizeCallback): Unsubscribe {
        this.resizeListeners.add(callback);

        return () => this.resizeListeners.delete(callback);
    }

    private notifyResizeListeners() {
        const heightToNotifyOf = this._domContainer.getBoundingClientRect().height;

        this.resizeListeners.forEach((listener) => listener(heightToNotifyOf));
    }
}
