import {BLOCK_NAME} from '../common';
import {isHTMLElement, isIFrame, resizeIframeToFitContent, setIframeStyles} from '../plugin/utils';

export type OnIFrameInitializeCallback = (iframe: HTMLIFrameElement) => void;

export class HtmlController {
    private _blocks: Map<string, HTMLElement> = new Map();
    private _document: Document;
    private _onIFrameInitializeCallbacks: Map<string, OnIFrameInitializeCallback[]> = new Map();

    constructor(document: Document) {
        this._document = document;

        this._onDOMContentLoaded = this._onDOMContentLoaded.bind(this);
        this._onLoadIFrameHandler = this._onLoadIFrameHandler.bind(this);

        // initialize on DOM ready
        this._document.addEventListener('DOMContentLoaded', this._onDOMContentLoaded);
    }

    _setBlocks(dirtyBlocks: HTMLCollectionOf<Element>): void {
        this._blocks.clear();

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
        return this._document.getElementsByClassName(BLOCK_NAME);
    }

    _initializeIframe(iframe: HTMLIFrameElement): void {
        resizeIframeToFitContent(iframe);
        const callbacks = this._onIFrameInitializeCallbacks.get(iframe?.dataset?.diplodocId ?? '');
        callbacks?.forEach((callback) => callback(iframe));
    }

    _initialize(): void {
        // find all blocks with necessary class name
        const dirtyBlocks = this._findDirtyBlocks();

        // filter and collect only clear blocks (with correct data attribute)
        this._setBlocks(dirtyBlocks);

        // additionally initialize for iframes
        for (const [_, block] of this._blocks) {
            if (isIFrame(block)) {
                this._initializeIframe(block);
                block.addEventListener('load', this._onLoadIFrameHandler);
            }
        }
    }

    _finalizeIframe(iframe: HTMLIFrameElement): void {
        iframe.removeEventListener('load', this._onLoadIFrameHandler);
    }

    // ------------------------------
    // listeners

    _onDOMContentLoaded() {
        this._initialize();
    }

    _onLoadIFrameHandler(event: Event) {
        const block = event.target;
        if (isIFrame(block)) {
            this._initializeIframe(block);
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
        if (blockId) {
            const block = this._blocks.get(blockId);
            if (isIFrame(block)) {
                setIframeStyles(block, styles);
            }
        } else {
            this._blocks.forEach((block) => {
                if (isIFrame(block)) {
                    setIframeStyles(block, styles);
                }
            });
        }
    }

    onIFrameLoad(callback: (iframe: HTMLIFrameElement) => void, blockId?: string) {
        if (blockId) {
            const callbacks = this._onIFrameInitializeCallbacks.get(blockId);
            const newCallbacks = callbacks?.length ? [...callbacks, callback] : [callback];
            this._onIFrameInitializeCallbacks.set(blockId, newCallbacks);
        } else {
            this._blocks.forEach((block) => {
                const {diplodocId = ''} = block.dataset;
                const callbacks = this._onIFrameInitializeCallbacks.get(diplodocId);
                const newCallbacks = callbacks?.length ? [...callbacks, callback] : [callback];
                this._onIFrameInitializeCallbacks.set(diplodocId, newCallbacks);
            });
        }
    }
}
