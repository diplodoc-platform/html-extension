import {IEmbeddedContentController} from './IEmbeddedContentController';
import {Deferred, Disposable, TaskQueue} from '../utils';
import {IFrameController} from '../iframe/IFrameController';
import {EmbedsConfig} from '../types';
import {DEFAULT_IFRAME_HEIGHT_PADDING} from '../constants';

const validateHostElement: (el: HTMLElement) => asserts el is HTMLIFrameElement = (el) => {
    if (!(el instanceof HTMLIFrameElement && el.dataset.yfmSandboxMode === 'srcdoc')) {
        throw new Error('Host element for `srcdoc` embedding mode was not configured properly');
    }
};

const ensureIframeLoaded = (host: HTMLIFrameElement) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow
    // says nothing about `contentWindow` being nullable
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const document = host.contentWindow!.document;

    return new Promise<void>((resolve) => {
        const listener = function (this: HTMLIFrameElement) {
            resolve();
            this.removeEventListener('load', listener);
        };

        if (['complete', 'interactive'].includes(document.readyState)) {
            resolve();
        } else {
            host.addEventListener('load', listener);
        }
    });
};

export class SrcDocIFrameController extends Disposable implements IEmbeddedContentController {
    private readonly host: HTMLIFrameElement;
    private readonly config: EmbedsConfig;
    private readonly taskQueue: TaskQueue;
    private readonly controllerInitialiazedFuse = new Deferred<void>();

    private iframeController: IFrameController | null = null;

    constructor(host: HTMLElement, config: EmbedsConfig) {
        validateHostElement(host);

        super();

        this.host = host;
        this.config = config;
        this.taskQueue = new TaskQueue(this.controllerInitialiazedFuse.promise);
    }

    async initialize() {
        await this.instantiateController();

        await this.setRootClassNames(this.config.classNames);
        await this.setRootStyles(this.config.styles);

        this.updateIFrameHeight(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.host.contentWindow!.document.body.getBoundingClientRect().height,
        );
    }

    setRootClassNames(classNames: string[] | undefined) {
        return this.executeOnController((controller) => controller.setClassNames(classNames));
    }

    setRootStyles(styles: Record<string, string> | undefined) {
        return this.executeOnController((controller) => controller.setStyles(styles));
    }

    private async instantiateController() {
        await ensureIframeLoaded(this.host);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const controller = new IFrameController(this.host.contentWindow!.document.body);

        this.iframeController = controller;

        this.dispose.add(() =>
            controller.on('resize', (value) => this.updateIFrameHeight(value.height)),
        );
        this.dispose.add(() => controller.dispose());

        return this.controllerInitialiazedFuse.resolve();
    }

    private executeOnController(execution: (controller: IFrameController) => void) {
        return this.taskQueue.run(async () => {
            if (this.iframeController === null) {
                throw new Error(
                    'Tried to operate on IFrameController, but it was not yet initialized',
                );
            }

            return execution(this.iframeController);
        });
    }

    private updateIFrameHeight(value: number) {
        this.host.style.height = `${value + DEFAULT_IFRAME_HEIGHT_PADDING}px`;
    }
}
