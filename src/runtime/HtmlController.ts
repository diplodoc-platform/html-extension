import {BLOCK_NAME, HTMLControllerForEachCallback, IHtmlIFrameController} from '../common';
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

    private _resizeToFitContent() {
        resizeIframeToFitContent(this._block);
    }

    private _onLoadIFrameHandler() {
        this._queueManager.start();
    }
}

export class HtmlController {
    private _blocks: Map<string, HtmlIFrameController> = new Map();
    private _document: Document;

    constructor(document: Document) {
        this._document = document;

        this._onDOMContentLoaded = this._onDOMContentLoaded.bind(this);

        // initialize on DOM ready
        this._document.addEventListener('DOMContentLoaded', this._onDOMContentLoaded);
    }

    get blocks(): HtmlIFrameController[] {
        return Array.from(this._blocks.values());
    }

    reinitialize() {
        this._destroyBlocks();
        this._initialize();
    }

    forEach(callback: HTMLControllerForEachCallback) {
        return this._blocks.forEach((value) => {
            value.execute(callback);
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
    }
}
