import {IFrameControllerRPCAPI} from '../iframe';
import {RPCConsumer} from '../rpcAdapter/consumer';
import {PostMessageChannel} from '../rpcAdapter/PostMessageChannel';
import {IEmbeddedContentController} from './IEmbeddedContentController';

export class EmbeddedIFrameController implements IEmbeddedContentController {
    private readonly iframeElement: HTMLIFrameElement;
    private readonly rpcConsumer: RPCConsumer<IFrameControllerRPCAPI>;

    constructor(iframeElement: HTMLIFrameElement) {
        this.iframeElement = iframeElement;
        this.rpcConsumer = new RPCConsumer(
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow
            // says nothing about `contentWindow` being nullable
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            new PostMessageChannel(this.iframeElement.contentWindow!),
        );
    }

    setRootClassNames(classNames: string[] | undefined) {
        return this.rpcConsumer.dispatchCall('setClassNames', classNames);
    }

    setRootStyles(styles: Record<string, string> | undefined) {
        return this.rpcConsumer.dispatchCall('setStyles', styles);
    }
}
