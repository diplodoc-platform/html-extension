import {DEFAULT_CONTAINER_CONFIG} from '../constants';
import {IFrameControllerRPCAPI} from '../iframe';
import {RPCConsumer} from '../rpcAdapter/consumer';
import {PostMessageChannel} from '../rpcAdapter/PostMessageChannel';
import {IHTMLIFrameControllerConfig} from '../types';
import {IEmbeddedContentController} from './IEmbeddedContentController';

const DEFAULT_PADDING = 34;

type DatasetShape = {
    yfmSandboxMode: 'isolated';
    yfmSandboxContent: string;
    yfmSandboxBaseTarget?: string;
};

const assertIFrame: (element: HTMLElement) => asserts element is HTMLIFrameElement = (element) => {
    if (element instanceof HTMLIFrameElement) {
        return;
    }

    throw new Error('Provided element is not an IFrame');
};

const isHTMLSandboxContainer = (dataset: DOMStringMap): dataset is DatasetShape =>
    dataset.yfmSandboxMode === 'isolated' && typeof dataset.yfmSandboxContent === 'string';

export class EmbeddedIFrameController implements IEmbeddedContentController {
    private readonly iframeElement: HTMLIFrameElement;
    private readonly rpcConsumer: RPCConsumer<IFrameControllerRPCAPI>;
    private readonly initParameters: DatasetShape;
    private readonly config: IHTMLIFrameControllerConfig;

    private readonly disposeResizeEventListener: () => void;

    constructor(
        iframeElement: HTMLElement,
        config: IHTMLIFrameControllerConfig = DEFAULT_CONTAINER_CONFIG,
    ) {
        const dataset = iframeElement.dataset;

        assertIFrame(iframeElement);

        if (!isHTMLSandboxContainer(dataset)) {
            throw new Error(
                'Tried to initialize a sandbox controller on an iframe that is not properly set up',
            );
        }

        this.iframeElement = iframeElement;
        this.initParameters = dataset;
        this.config = config;

        this.rpcConsumer = new RPCConsumer(
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow
            // says nothing about `contentWindow` being nullable
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            new PostMessageChannel(this.iframeElement.contentWindow!),
        );

        this.disposeResizeEventListener = this.rpcConsumer.on('resizedToNewHeight', (value) =>
            this.updateIFrameHeight(value),
        );
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

    destroy() {
        this.disposeResizeEventListener();
        this.rpcConsumer.destroy();
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
