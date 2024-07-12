import debounce from 'lodash.debounce';

import {BLOCK_NAME} from '../constants';
import {
    ControllerCallback,
    IHTMLIFrameElementConfig,
    IHtmlController,
    IHtmlIFrameController,
} from '../types';
import {QueueManager, createQueueWithWait, isHTMLElement, isIFrameLoaded} from './utils';
import {DEFAULT_PADDING, resizeIframeToFitContent} from '../utils';

const DEFAULT_CONFIG = {
    classNames: [],
    resizeDelay: 150,
    resizePadding: DEFAULT_PADDING,
    styles: {},
};

export class HtmlIFrameController implements IHtmlIFrameController {
    private _block: HTMLIFrameElement;
    private _classNames: string[] = [];
    private _config: IHTMLIFrameElementConfig;
    private _queueManager: QueueManager<IHtmlIFrameController>;
    private _resizeObserver: ResizeObserver;
    private _styles: Record<string, string> = {};

    constructor(iframe: HTMLIFrameElement, config: IHTMLIFrameElementConfig = DEFAULT_CONFIG) {
        this._block = iframe;
        this._config = config;
        this._queueManager = createQueueWithWait(this);

        this._onLoadIFrameHandler = this._onLoadIFrameHandler.bind(this);
        this._onResizeHandler = this._onResizeHandler.bind(this);
        this._resizeToFitContent = this._resizeToFitContent.bind(this);

        this._queueManager.push(this._resizeToFitContent);
        this._queueManager.push(() => this.setClassNames(config.classNames));
        this._queueManager.push(() => this.setStyles(config.styles));

        this._resizeObserver = new window.ResizeObserver(
            debounce(this._onResizeHandler, this._config.resizeDelay),
        );

        if (isIFrameLoaded(this._block)) {
            this._queueManager.start();
        } else {
            this._block.addEventListener('load', this._onLoadIFrameHandler);
            this._resizeObserver.observe(this._block);
        }
    }

    destroy() {
        this._block.removeEventListener('load', this._onLoadIFrameHandler);
        this._resizeObserver.disconnect();
    }

    get block() {
        return this._block;
    }

    execute(callback: (controller: IHtmlIFrameController) => void) {
        this._queueManager.push(callback);
    }

    resize() {
        this._resizeToFitContent();
    }

    setConfig(config: IHTMLIFrameElementConfig) {
        this._config = config;
    }

    setClassNames(classNames: string[] | undefined) {
        const body = this._block.contentWindow?.document.body;

        if (classNames && body) {
            const previousClassNames = this._classNames || [];

            // remove all classes that were in previousClassNames but are not in classNames
            previousClassNames.forEach((className) => {
                if (!classNames.includes(className)) {
                    body.classList.remove(className);
                }
            });

            // add classes that are in classNames
            classNames.forEach((className) => {
                if (!body.classList.contains(className)) {
                    body.classList.add(className);
                }
            });

            // update this._classNames to the new classNames
            this._classNames = classNames;
        }
    }

    setStyles(styles: Record<string, string> | undefined) {
        const body = this._block.contentWindow?.document.body;
        if (styles && body) {
            const previousStyles = this._styles;

            // remove all styles that are in previousStyles but not in styles
            Object.keys(previousStyles).forEach((property) => {
                if (!Object.prototype.hasOwnProperty.call(styles, property)) {
                    body.style.removeProperty(property);
                }
            });

            // sdd or update styles that are in styles
            Object.keys(styles).forEach((property) => {
                body.style.setProperty(property, styles[property]);
            });

            // update this._styles to the new styles
            this._styles = styles;
        }
    }

    private _resizeToFitContent() {
        resizeIframeToFitContent(this._block, this._config.resizePadding);
    }

    private _onLoadIFrameHandler() {
        this._queueManager.start();
    }

    private _onResizeHandler() {
        this._queueManager.push(this._resizeToFitContent);
    }
}

// Finds all iframes and creates controllers for each iframe
export class HtmlController implements IHtmlController {
    private _blocks: Map<string, HtmlIFrameController> = new Map();
    private _config: IHTMLIFrameElementConfig;
    private _document: Document;

    constructor(document: Document, config: IHTMLIFrameElementConfig = DEFAULT_CONFIG) {
        this._config = config;
        this._document = document;

        this._onDOMContentLoaded = this._onDOMContentLoaded.bind(this);

        // initialize on DOM ready
        this._document.addEventListener('DOMContentLoaded', this._onDOMContentLoaded);
    }

    destroy() {
        this._document.removeEventListener('DOMContentLoaded', this._onDOMContentLoaded);
    }

    get blocks(): HtmlIFrameController[] {
        return Array.from(this._blocks.values());
    }

    reinitialize() {
        this._destroyBlocks();
        this._initialize();
    }

    setConfig(config: IHTMLIFrameElementConfig) {
        this._config = config;
    }

    forEach(callback: ControllerCallback<IHtmlIFrameController>) {
        return this._blocks.forEach((block) => {
            block.execute(callback);
        });
    }

    private _createBlocks(dirtyBlocks: HTMLCollectionOf<Element>): void {
        for (const block of dirtyBlocks) {
            if (isHTMLElement(block)) {
                const {diplodocKey, diplodocId = ''} = block.dataset;

                if (diplodocKey === BLOCK_NAME) {
                    this._blocks.set(
                        diplodocId,
                        new HtmlIFrameController(block as HTMLIFrameElement, this._config),
                    );
                }
            }
        }
    }

    private _destroyBlocks() {
        this._blocks.clear();
    }

    private _findDirtyBlocks(): HTMLCollectionOf<Element> {
        return this._document.getElementsByClassName(BLOCK_NAME);
    }

    private _initialize(): void {
        // find all blocks with necessary class name
        const dirtyBlocks = this._findDirtyBlocks();

        // filter and collect only clear blocks (with correct data attribute)
        this._createBlocks(dirtyBlocks);
    }

    private _onDOMContentLoaded() {
        this._initialize();
    }
}
