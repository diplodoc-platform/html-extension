import {Deferred, Disposable, TaskQueue} from '../utils';
import {IFrameController} from '../iframe/IFrameController';
import {EmbedsConfig} from '../types';
import {DEFAULT_IFRAME_HEIGHT_PADDING} from '../constants';

import {IEmbeddedContentController} from './IEmbeddedContentController';

const PARENT_LOADED_AND_RESIZED_TIMEOUT = 500;

const validateHostElement: (el: HTMLElement) => asserts el is HTMLIFrameElement = (el) => {
    if (!(el instanceof HTMLIFrameElement && el.dataset.yfmSandboxMode === 'srcdoc')) {
        throw new Error('Host element for `srcdoc` embedding mode was not configured properly');
    }
};

const isBodyContentLoaded = (document: Document) => {
    const innerHTML = document.body ? document.body.innerHTML : '';
    return ['complete', 'interactive'].includes(document.readyState) && Boolean(innerHTML);
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

        if (isBodyContentLoaded(document)) {
            resolve();
        } else {
            host.addEventListener('load', listener);
        }
    });
};

const createLinkCLickHandler = (value: Element, document: Document) => (event: Event) => {
    event.preventDefault();
    const targetId = value.getAttribute('href');

    if (targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({behavior: 'smooth'});
        }
    }
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

        this.addAnchorLinkHandlers();
        this.handleHashChange();
    }

    // finds all relative links (href^="#") and changes their click behavior
    addAnchorLinkHandlers() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const document = this.host.contentWindow!.document;

        if (document) {
            document.querySelectorAll('a[href^="#"]').forEach((value: Element) => {
                const handler = createLinkCLickHandler(value, document);
                value.addEventListener('click', handler);

                this.dispose.add(() => {
                    value.removeEventListener('click', handler);
                });
            });
        }
    }

    setRootClassNames(classNames: string[] | undefined) {
        return this.executeOnController((controller) => controller.setClassNames(classNames));
    }

    setRootStyles(styles: Record<string, string> | undefined) {
        return this.executeOnController((controller) => controller.setStyles(styles));
    }

    private scrollToHash() {
        const hash = window.location.hash.substring(1);

        if (hash) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const document = this.host.contentWindow!.document;
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({behavior: 'smooth'});
            }
        }
    }

    private async handleHashChange() {
        // цait until all iframes managed by the parent controller are fully loaded,
        // and parent containers have heights properly adjusted.
        setTimeout(() => {
            this.scrollToHash();
        }, PARENT_LOADED_AND_RESIZED_TIMEOUT);

        const handleHashChange = () => this.scrollToHash();
        window.addEventListener('hashchange', handleHashChange);
        this.dispose.add(() => window.removeEventListener('hashchange', handleHashChange));
    }

    private async instantiateController() {
        await ensureIframeLoaded(this.host);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const controller = new IFrameController(this.host.contentWindow!.document.body);

        this.iframeController = controller;

        this.dispose.add(controller.on('resize', (value) => this.updateIFrameHeight(value.height)));
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
        // DEFAULT_IFRAME_HEIGHT_PADDING is used to account for the height
        // difference resulting from the calculation of height by the script,
        // due to margin collapsing.
        this.host.style.height = `${value + DEFAULT_IFRAME_HEIGHT_PADDING}px`;
    }
}
