import {RPCConsumer} from '../rpcAdapter/RPCConsumer';
import {PostMessageChannel} from '../rpcAdapter/PostMessageChannel';
import {IHTMLIFrameControllerConfig} from '../types';
import {IEmbeddedContentController} from './IEmbeddedContentController';
import {Disposable} from './Disposable';

const DEFAULT_PADDING = 34;

type DatasetShape = {
    yfmSandboxMode: 'isolated';
    yfmSandboxContent: string;
    yfmSandboxBaseTarget?: string;
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
    private readonly config: IHTMLIFrameControllerConfig;

    constructor(host: HTMLElement, config: IHTMLIFrameControllerConfig) {
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

        this.dispose.add(
            this.rpcConsumer.on('resize', (value) => this.updateIFrameHeight(value.height)),
        );

        this.dispose.add(this.rpcConsumer.dispose);
    }

    async initialize() {
        const {yfmSandboxContent, yfmSandboxBaseTarget} = this.initParameters;

        await this.rpcConsumer.start();

        await this.setRootClassNames(this.config.classNames);
        await this.setRootStyles(this.config.styles);

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

    private updateIFrameHeight(value: number) {
        this.iframeElement.style.height = `${value + DEFAULT_PADDING}px`;
    }
}
