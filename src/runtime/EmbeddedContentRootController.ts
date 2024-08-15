import {nanoid} from 'nanoid';
import {IHTMLIFrameControllerConfig} from '../types';
import {EmbeddedIFrameController} from './EmbeddedIFrameController';
import {IEmbeddedContentController} from './IEmbeddedContentController';
import {ShadowRootController} from './ShadowRootController';
import {IHTMLIFrameElementConfig} from '.';
import {Disposable} from './Disposable';

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
export class EmbeddedContentRootController extends Disposable {
    private children: Map<string, IEmbeddedContentController> = new Map();
    private config: IHTMLIFrameControllerConfig;
    private document: Document;

    constructor(
        document: Document,
        config: IHTMLIFrameControllerConfig = {
            classNames: [],
            styles: {},
        },
    ) {
        super();

        this.config = config;
        this.document = document;

        // initialize on DOM ready
        this.document.addEventListener('DOMContentLoaded', this.initialize);
        this.dispose.add(() => {
            this.document.removeEventListener('DOMContentLoaded', this.initialize);
        });

        this.dispose.add(this.disposeChildren);
    }

    initialize = async () => {
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
    };

    private disposeChildren = () => {
        this.children.forEach((controller) => controller.dispose());
        this.children.clear();
    };

    get blocks(): IEmbeddedContentController[] {
        return Array.from(this.children.values());
    }

    setConfig(config: IHTMLIFrameControllerConfig) {
        this.config = config;
    }

    forEach(callback: (controller: IEmbeddedContentController) => void) {
        return this.children.forEach((controller) => callback(controller));
    }
}
