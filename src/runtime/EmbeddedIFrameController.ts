import {RPCConsumer} from '../rpcAdapter/RPCConsumer';
import {PostMessageChannel} from '../rpcAdapter/PostMessageChannel';
import {EmbedsConfig} from '../types';
import {Disposable} from '../utils';

import {IEmbeddedContentController} from './IEmbeddedContentController';

type DatasetShape = {
    yfmSandboxMode: 'isolated';
    yfmSandboxContent: string;
    yfmSandboxBaseTarget?: string;
    yfmSandboxPreferredIsolatedHostUri?: string;
};

type ValidIFrameElement = HTMLIFrameElement & {
    dataset: DatasetShape;
};

const isHTMLSandboxContainer = (dataset: DOMStringMap): dataset is DatasetShape =>
    dataset.yfmSandboxMode === 'isolated' && typeof dataset.yfmSandboxContent === 'string';

const validateHostElement: (el: HTMLElement) => asserts el is ValidIFrameElement = (el) => {
    if (!(el instanceof HTMLIFrameElement)) {
        throw new Error('Provided element is not an IFrame');
    }

    if (!isHTMLSandboxContainer(el.dataset)) {
        throw new Error(
            'Tried to initialize a sandbox controller on an iframe that is not properly set up',
        );
    }

    return true;
};

export class EmbeddedIFrameController extends Disposable implements IEmbeddedContentController {
    private readonly iframeElement: ValidIFrameElement;
    private readonly rpcConsumer: RPCConsumer;
    private readonly initParameters: DatasetShape;
    private readonly config: EmbedsConfig;

    constructor(host: HTMLElement, config: EmbedsConfig) {
        validateHostElement(host);

        super();

        this.iframeElement = host;
        this.initParameters = host.dataset;
        this.config = config;

        this.rpcConsumer = new RPCConsumer(
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow
            // says nothing about `contentWindow` being nullable
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            new PostMessageChannel(this.iframeElement.contentWindow!),
        );

        this.dispose.add(this.rpcConsumer.on('resize', () => this.updateIFrameHeight()));

        this.dispose.add(() => this.rpcConsumer.dispose());
    }

    async initialize() {
        const {classNames, styles, isolatedSandboxHostURIOverride} = this.config;
        const {yfmSandboxContent, yfmSandboxBaseTarget, yfmSandboxPreferredIsolatedHostUri} =
            this.initParameters;

        const authoritativeSandboxHost =
            isolatedSandboxHostURIOverride ?? yfmSandboxPreferredIsolatedHostUri;

        if (typeof authoritativeSandboxHost !== 'string') {
            throw new Error('Could not resolve IsolatedSandboxHostURI.');
        }

        this.iframeElement.src = authoritativeSandboxHost;

        await this.rpcConsumer.start();

        await this.setRootClassNames(classNames);
        await this.setRootStyles(styles);

        if (yfmSandboxBaseTarget) {
            await this.rpcConsumer.dispatchCall('setBaseTarget', yfmSandboxBaseTarget);
        }

        return this.replaceIFrameHTML(yfmSandboxContent);
    }

    setRootClassNames(classNames: string[] | undefined) {
        return this.rpcConsumer.dispatchCall('setClassNames', classNames);
    }

    setRootStyles(styles: Record<string, string> | undefined) {
        return this.rpcConsumer.dispatchCall('setStyles', styles);
    }

    private replaceIFrameHTML(html: string) {
        return this.rpcConsumer.dispatchCall('replaceHTML', html);
    }

    private updateIFrameHeight() {
        const contentWindow = this.iframeElement.contentWindow;

        if (!contentWindow) {
            return;
        }

        const html = contentWindow.document.documentElement;

        this.iframeElement.style.height = `${html.getBoundingClientRect().height}px`;
    }
}
