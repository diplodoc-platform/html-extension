import {BLOCK_NAME} from '../constants';
import {
    ControllerCallback,
    IHTMLIFrameControllerConfig,
    IHtmlController,
    IHtmlIFrameController,
} from '../types';
import {isHTMLElement} from './utils';

// Finds all iframes and creates controllers for each iframe
export class HtmlController implements IHtmlController {
    private _blocks: Map<string, HtmlIFrameController> = new Map();
    private _config: IHTMLIFrameControllerConfig;
    private _document: Document;

    constructor(document: Document, config: IHTMLIFrameControllerConfig = DEFAULT_CONFIG) {
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

    setConfig(config: IHTMLIFrameControllerConfig) {
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
