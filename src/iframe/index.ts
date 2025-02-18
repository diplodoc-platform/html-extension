import {PostMessageChannel} from '../rpcAdapter/PostMessageChannel';
import {APIPublisher} from '../rpcAdapter/APIPublisher';

import {IFrameController} from './IFrameController';

export type {Commands, Events} from './IFrameController';

const $$PublisherInstanceSymbol = Symbol.for('$$RPCAPIPublisher');

const onDOMReady = () => {
    const controller = new IFrameController(globalThis.window);
    const publisher = new APIPublisher(new PostMessageChannel(globalThis.parent));

    publisher
        .onCommand('setStyles', controller.setStyles)
        .onCommand('setClassNames', controller.setClassNames)
        .onCommand('replaceHTML', controller.replaceHTML)
        .onCommand('setBaseTarget', controller.setBaseTarget);

    controller.on('resize', (rect) => publisher.dispatchEvent('resize', rect));

    publisher.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)[$$PublisherInstanceSymbol] = publisher;
};

if (['complete', 'interactive'].includes(document.readyState)) {
    onDOMReady();
} else {
    window.addEventListener('DOMContentLoaded', onDOMReady);
}
