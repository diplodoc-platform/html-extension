import {BLOCK_NAME} from '../common';
import {isHTMLElement, isIFrame, resizeIframeToFitContent, setIframeStyles} from '../plugin/utils';

export class HtmlController {
    private _blocks: Map<string, HTMLElement> = new Map();
    private _document: Document;
    private _onIFrameInitializeCallbacks: Map<string, ((iframe: HTMLIFrameElement) => void)[]> = new Map();

    constructor(document: Document) {
        console.log('constructor');
        this._document = document;

        this._onDOMContentLoaded = this._onDOMContentLoaded.bind(this);
        this._onLoadIFrameHandler = this._onLoadIFrameHandler.bind(this);

        // initialize on DOM ready
        this._document.addEventListener('DOMContentLoaded', this._onDOMContentLoaded);
    }

    _setBlocks(dirtyBlocks: HTMLCollectionOf<Element>): void {
        console.log('_setBlocks');
        this._blocks.clear();

        console.log('this._blocks', JSON.stringify(this._blocks.keys()));

        for (const block of dirtyBlocks) {
            if (isHTMLElement(block)) {
                const {diplodocKey, diplodocId = ''} = block.dataset;
                if (diplodocKey === BLOCK_NAME) {
                    this._blocks.set(diplodocId, block);
                }
            }
        }
    }

    _findDirtyBlocks(): HTMLCollectionOf<Element> {
        console.log('_findDirtyBlocks');
        return this._document.getElementsByClassName(BLOCK_NAME);
    }

    _initializeIframe(iframe: HTMLIFrameElement): void {
        console.log('_initializeIframe');

        console.log('выполняю resizeIframeToFitContent')
        resizeIframeToFitContent(iframe);
        const callbacks = this._onIFrameInitializeCallbacks.get(iframe?.dataset?.diplodocId ?? '');
        console.log('callbacks', callbacks);
        callbacks?.forEach(callback => callback(iframe))

    }

    _initialize(): void {
        console.log('_initialize');

        // find all blocks with necessary class name
        const dirtyBlocks = this._findDirtyBlocks();

        // filter and collect only clear blocks (with correct data attribute)
        this._setBlocks(dirtyBlocks);

        // additionally initialize for iframes
        for (const [_, block] of this._blocks) {
            if (isIFrame(block)) {
                this._initializeIframe(block);
                console.log('+ добавляю _onLoadIFrameHandler');
                block.addEventListener('load', this._onLoadIFrameHandler);

            }
        }
    }

    _finalizeIframe(iframe: HTMLIFrameElement): void {
        console.log('_finalizeIframe');
        console.log('– удаляю _onLoadIFrameHandler');
        iframe.removeEventListener('load', this._onLoadIFrameHandler);
    }

    // ------------------------------
    // listeners

    _onDOMContentLoaded() {
        console.log('_onDOMContentLoaded');
        this._initialize();
    }

    _onLoadIFrameHandler(event: Event) {
        console.log('_onLoadIFrameHandler');

        const block = event.target;
        if (isIFrame(block)) {
            this._initializeIframe(block)
        }
    }

    // ------------------------------
    // public methods

    getBlock(blockId: string): HTMLElement | undefined {
        return this._blocks.get(blockId);
    }

    reinitialize() {
        for (const [_, block] of this._blocks) {
            if (isIFrame(block)) {
                this._finalizeIframe(block);
            }
        }
        this._initialize();
    }

    setStyles(styles: Record<string, string>, blockId?: string) {
        if (!blockId) {
            this._blocks.forEach(block => {
                if (isIFrame(block)) {
                    setIframeStyles(block, styles);
                }
            });

        } else {
            const block = this._blocks.get(blockId);
            if (isIFrame(block)) {
                setIframeStyles(block, styles);
            }
        }
    }

    onIFrameLoad(callback: (iframe: HTMLIFrameElement) => void, blockId?: string) {
        if(!blockId) {
            this._onIFrameInitializeCallbacks.forEach((callbacks, key) => {
                this._onIFrameInitializeCallbacks.set(key, callbacks?.length ? [...callbacks, callback] : [callback])
            });
        } else {
            const callbacks = this._onIFrameInitializeCallbacks.get(blockId);
            this._onIFrameInitializeCallbacks.set(blockId, callbacks?.length ? [...callbacks, callback] : [callback]);
        }
    }
}
