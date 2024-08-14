import {DEFAULT_CONTAINER_CONFIG} from '../constants';
import {IHTMLIFrameControllerConfig} from '../types';
import {updateClassNames, updateStyles} from '../utils/reconcile';
import {IEmbeddedContentController} from './IEmbeddedContentController';

const validateHostElement = (el: HTMLElement) => {
    const dataset = el.dataset;

    if (el.shadowRoot === null || dataset.yfmSandboxMode !== 'shadow') {
        throw new Error('The host is not a valid element');
    }
};

export class ShadowRootController implements IEmbeddedContentController {
    private readonly host: HTMLElement;
    private classNames: string[] = [];
    private styles: Record<string, string> = {};

    constructor(host: HTMLElement, config: IHTMLIFrameControllerConfig = DEFAULT_CONTAINER_CONFIG) {
        const {classNames: initialClassNames, styles: initialStyles} = config;

        validateHostElement(host);

        this.host = host;

        this.setRootClassNames(initialClassNames);
        this.setRootStyles(initialStyles);
    }

    initialize() {
        return Promise.resolve();
    }

    destroy() {}

    setRootClassNames(classNames: string[] | undefined = []) {
        updateClassNames(this.host, classNames, this.classNames);

        this.classNames = classNames;

        return Promise.resolve();
    }

    setRootStyles(styles: Record<string, string> | undefined = {}) {
        updateStyles(this.host, styles, this.styles);

        this.styles = styles;

        return Promise.resolve();
    }
}
