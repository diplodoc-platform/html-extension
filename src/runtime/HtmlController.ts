import debounce from 'lodash.debounce';

import {BLOCK_NAME} from '../constants';
import {ControllerCallback, IHtmlController, IHtmlIFrameController} from '../types';
import {
    QueueManager,
    createQueueWithWait,
    isHTMLElement,
    isIFrameLoaded,
    resizeIframeToFitContent,
    setIframeStyles,
} from './utils';

export class HtmlIFrameController implements IHtmlIFrameController {
    private _block: HTMLIFrameElement;
    private _queueManager: QueueManager<IHtmlIFrameController>;

    constructor(iframe: HTMLIFrameElement) {
        this._block = iframe;
        this._queueManager = createQueueWithWait(this);

        this._resizeToFitContent = this._resizeToFitContent.bind(this);
        this._onLoadIFrameHandler = this._onLoadIFrameHandler.bind(this);
        this._onResizeHandler = this._onResizeHandler.bind(this);

        this._queueManager.push(this._resizeToFitContent);

        if (isIFrameLoaded(this._block)) {
            this._queueManager.start();
        } else {
            this._block.addEventListener('load', this._onLoadIFrameHandler);
        }
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

    private _resizeToFitContent() {
        resizeIframeToFitContent(this._block);
    }

    private _onLoadIFrameHandler() {
        this._queueManager.start();
    }

    private _onResizeHandler(event: MessageEvent) {
        if (event.data.type === 'resize') {
            this._queueManager.push(this._resizeToFitContent);
        }
    }
}

export class HtmlController implements IHtmlController {
    private _blocks: Map<string, HtmlIFrameController> = new Map();
    private _document: Document;
    private _resizeObserver: ResizeObserver;

    constructor(document: Document) {
        this._document = document;

        this._onDOMContentLoaded = this._onDOMContentLoaded.bind(this);

        // initialize on DOM ready
        this._document.addEventListener('DOMContentLoaded', this._onDOMContentLoaded);
        this._resizeObserver = new window.ResizeObserver(debounce(this._onIFrameResize, 150));
    }

    get blocks(): HtmlIFrameController[] {
        return Array.from(this._blocks.values());
    }

    reinitialize() {
        this._destroyBlocks();
        this._initialize();
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
                        new HtmlIFrameController(block as HTMLIFrameElement),
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
        this._blocks.forEach((block) => {
            this._resizeObserver.observe(block.block);
        });
    }

    private _onIFrameResize(entries: ResizeObserverEntry[]) {
        for (const entry of entries) {
            resizeIframeToFitContent(entry.target as HTMLIFrameElement);
        }
    }
}
