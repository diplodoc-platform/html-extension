import {nanoid} from 'nanoid';
import {DEFAULT_CONTAINER_CONFIG} from '../constants';
import {ControllerCallback, IHTMLIFrameControllerConfig} from '../types';
import {EmbeddedIFrameController} from './EmbeddedIFrameController';
import {IEmbeddedContentController} from './IEmbeddedContentController';
import {ShadowRootController} from './ShadowRootController';
import {IHTMLIFrameElementConfig} from '.';

type SandboxMode = 'shadow' | 'isolated';

const findAllShadowContainers = (scope: ParentNode) =>
    scope.querySelectorAll<HTMLDivElement>('div[data-yfm-sandbox-mode=shadow]');
const findAllIFrameEmbeds = (scope: ParentNode) =>
    scope.querySelectorAll<HTMLIFrameElement>('iframe[data-yfm-sandbox-mode=isolated]');

const modeToController: Record<
    SandboxMode,
    new (node: HTMLElement, config: IHTMLIFrameElementConfig) => IEmbeddedContentController
> = {
    shadow: ShadowRootController,
    isolated: EmbeddedIFrameController,
};

// Finds all iframes and creates controllers for each iframe
export class EmbeddedContentRootController {
    private children: Map<string, IEmbeddedContentController> = new Map();
    private config: IHTMLIFrameControllerConfig;
    private document: Document;

    constructor(
        document: Document,
        config: IHTMLIFrameControllerConfig = DEFAULT_CONTAINER_CONFIG,
    ) {
        this.config = config;
        this.document = document;

        this.onDOMContentLoaded = this.onDOMContentLoaded.bind(this);

        // initialize on DOM ready
        this.document.addEventListener('DOMContentLoaded', this.onDOMContentLoaded);
    }

    async initialize() {
        const dirtyEmbeds = [
            ...findAllShadowContainers(this.document),
            ...findAllIFrameEmbeds(this.document),
        ].filter(
            (el) =>
                typeof el.dataset.yfmEmbedId !== 'string' ||
                !this.children.has(el.dataset.yfmEmbedId),
        );

        const instantiatedControllers = dirtyEmbeds.map((embed) => {
            const embedId = nanoid();

            const mode = embed.dataset.yfmSandboxMode as SandboxMode; // this cast is safe at this point
            const ControllerCtor = modeToController[mode];

            const instance = new ControllerCtor(embed, this.config);

            embed.dataset.yfmEmbedId = embedId;
            this.children.set(embedId, instance);

            return instance;
        });

        return Promise.all(instantiatedControllers.map((ctrller) => ctrller.initialize()));
    }

    destroyChildren() {
        this.children.forEach((controller) => controller.destroy());
        this.children.clear();
    }

    destroy() {
        this.document.removeEventListener('DOMContentLoaded', this.onDOMContentLoaded);
        this.destroyChildren();
    }

    get blocks(): IEmbeddedContentController[] {
        return Array.from(this.children.values());
    }

    setConfig(config: IHTMLIFrameControllerConfig) {
        this.config = config;
    }

    forEach(callback: ControllerCallback<IEmbeddedContentController>) {
        return this.children.forEach((controller) => callback(controller));
    }

    private onDOMContentLoaded() {
        this.initialize();
    }
}
