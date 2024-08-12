import {PostMessageChannel} from '../rpcAdapter/PostMessageChannel';
import {APIPublisher} from '../rpcAdapter/publisher';
import {HtmlIFrameController} from './HtmlIFrameController';
import {apiBlueprintFromController} from './rpcApiPublisherBlueprint';

const $$PublisherInstanceSymbol = Symbol('$$RPCAPIPublisher');

const onDOMReady = () => {
    const iframeController = new HtmlIFrameController(globalThis.document.body);
    const apiBlueprint = apiBlueprintFromController(iframeController);

    const publisher = APIPublisher.fromBlueprint(
        new PostMessageChannel(globalThis.parent),
        apiBlueprint,
    );

    publisher.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)[$$PublisherInstanceSymbol] = publisher;
};

if (['complete', 'interactive'].includes(document.readyState)) {
    onDOMReady();
} else {
    window.addEventListener('DOMContentLoaded', onDOMReady);
}
