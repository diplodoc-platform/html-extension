import {Disposable, updateClassNames, updateStyles} from '../utils';

export abstract class BaseIFrameController extends Disposable {
    protected readonly iframe: HTMLIFrameElement | Window;
    protected readonly domContainer: HTMLElement;
    protected readonly domHtml: HTMLElement;

    private classNames: string[] = [];
    private styles: Record<string, string> = {};

    constructor(iframe: HTMLIFrameElement | Window) {
        super();

        this.iframe = iframe;

        const doc =
            'contentWindow' in iframe
                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  iframe.contentWindow!.document
                : iframe.document;

        this.domContainer = doc.body;
        this.domHtml = doc.documentElement;
    }

    setClassNames = (classNames: string[] | undefined = []) => {
        updateClassNames(this.domContainer, classNames, this.classNames);

        this.classNames = classNames;
    };

    setStyles = (styles: Record<string, string> | undefined = {}) => {
        updateStyles(this.domContainer, styles, this.styles);

        this.styles = styles;
    };

    replaceHTML = (htmlString: string) => {
        const fragment = globalThis.document.createRange().createContextualFragment(htmlString);

        this.domContainer.replaceChildren(fragment);
    };

    setBaseTarget = (value: string) => {
        const baseElement = this.getBaseElement();

        baseElement.setAttribute('target', value);
    };

    private getBaseElement() {
        const head = globalThis.document.head;

        const maybeExistingBase = head.querySelector('base');

        if (!maybeExistingBase) {
            const newBase = globalThis.document.createElement('base');

            head.appendChild(newBase);

            return newBase;
        }

        return maybeExistingBase;
    }
}
