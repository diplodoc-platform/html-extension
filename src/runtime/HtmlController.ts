import debounce from 'lodash.debounce';

import {BLOCK_NAME} from '../constants';
import {
    ControllerCallback,
    IHTMLIFrameElementConfig,
    IHtmlController,
    IHtmlIFrameController,
} from '../types';
import {
    QueueManager,
    createQueueWithWait,
    isHTMLElement,
    isIFrameLoaded,
    setIframeStyles,
} from './utils';
import {DEFAULT_PADDING, resizeIframeToFitContent} from '../utils';

const DEFAULT_CONFIG = {
    resizeDelay: 150,
    resizePadding: DEFAULT_PADDING,
};

export class HtmlIFrameController implements IHtmlIFrameController {
    private _block: HTMLIFrameElement;
    private _config: IHTMLIFrameElementConfig;
    private _queueManager: QueueManager<IHtmlIFrameController>;
    private _resizeObserver: ResizeObserver;

    constructor(iframe: HTMLIFrameElement, config: IHTMLIFrameElementConfig = DEFAULT_CONFIG) {
        this._block = iframe;
        this._config = config;
        this._queueManager = createQueueWithWait(this);

        this._onLoadIFrameHandler = this._onLoadIFrameHandler.bind(this);
        this._onResizeHandler = this._onResizeHandler.bind(this);
        this._resizeToFitContent = this._resizeToFitContent.bind(this);

        this._queueManager.push(this._resizeToFitContent);
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

    setStyles(styles: Record<string, string>): void {
        setIframeStyles(this._block, styles);
    }

    resize() {
        this._resizeToFitContent();
    }

    setConfig(config: IHTMLIFrameElementConfig) {
        this._config = config;
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
