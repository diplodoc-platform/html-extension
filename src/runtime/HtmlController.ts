import {HTML_CLASSNAME} from '../common';
import {resizeIframeToFitContent} from '../plugin/utils';

export class HtmlController {
    private _document: Document;
    private _blocks: Set<HTMLElement> = new Set();

    constructor(document: Document) {
        this._document = document;

        this.onDOMContentLoaded = this.onDOMContentLoaded.bind(this);

        this._document.addEventListener('click', (event) => {
            // ts-ignore no-console
            console.log('event', event);
        });
        this._document.addEventListener('DOMContentLoaded', this.onDOMContentLoaded);
    }

    _setBlocks(blocks: HTMLCollectionOf<HTMLElement>): void {
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const blockKey = block.dataset.diplodocKey;

            if (blockKey === 'html-block') {
                this._blocks.add(block);
            }
        }
    }

    onDOMContentLoaded() {
        const blocks = this._document.getElementsByClassName(HTML_CLASSNAME);
        this._setBlocks(blocks as HTMLCollectionOf<HTMLElement>);

        for (const iframe of this._blocks) {
            iframe.addEventListener('load', () => {
                resizeIframeToFitContent(iframe as HTMLIFrameElement);
            });
        }
    }
}
