import {EmbedsConfig} from '../types';
import {updateClassNames, updateStyles} from '../utils/reconcile';
import {IEmbeddedContentController} from './IEmbeddedContentController';
import {Disposable} from '../utils';

type DatasetShape = {
    yfmSandboxMode: 'shadow';
    yfmSandboxContent: string;
};

type ValidShadowContainer = HTMLDivElement & {
    dataset: DatasetShape;
};

const hasValidDataAttrs = (dataset: DOMStringMap): dataset is DatasetShape =>
    dataset.yfmSandboxMode === 'shadow' && typeof dataset.yfmSandboxContent === 'string';

const validateHostElement: (el: HTMLElement) => asserts el is ValidShadowContainer = (el) => {
    if (!(el instanceof HTMLDivElement)) {
        throw new Error('Provided shadow container is not a plain div');
    }

    if (!hasValidDataAttrs(el.dataset)) {
        throw new Error(
            'Tried to initialize a shadow embed controller on a container that is not properly set up',
        );
    }

    return true;
};

export class ShadowRootController extends Disposable implements IEmbeddedContentController {
    private readonly host: HTMLElement;
    private readonly initParameters: DatasetShape;
    private classNames: string[] = [];
    private styles: Record<string, string> = {};

    constructor(host: HTMLElement, config: EmbedsConfig) {
        super();

        const {classNames: initialClassNames, styles: initialStyles} = config;

        validateHostElement(host);

        this.host = host;
        this.initParameters = host.dataset;

        this.setRootClassNames(initialClassNames);
        this.setRootStyles(initialStyles);
    }

    async initialize() {
        const shadow = this.host.attachShadow({mode: 'open'});

        shadow.innerHTML = this.initParameters.yfmSandboxContent;
    }

    async setRootClassNames(classNames: string[] | undefined = []) {
        updateClassNames(this.host, classNames, this.classNames);

        this.classNames = classNames;
    }

    async setRootStyles(styles: Record<string, string> | undefined = {}) {
        updateStyles(this.host, styles, this.styles);

        this.styles = styles;
    }
}
