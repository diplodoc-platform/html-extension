export class HtmlController {
    // @ts-ignore
    private _document: Document;

    constructor(document: Document) {
        this._document = document;
        this._document.addEventListener('click', (event) => {
            console.log('event', event);
        });
    }
}
