import {nanoid} from 'nanoid';
import {EmbeddingMode, EmbedsConfig} from '../types';
import {EmbeddedIFrameController} from './EmbeddedIFrameController';
import {IEmbeddedContentController} from './IEmbeddedContentController';
import {ShadowRootController} from './ShadowRootController';
import {IHTMLIFrameElementConfig} from '.';
import {Disposable} from '../utils';
import {SrcDocIFrameController} from './SrcDocIFrameController';

const findAllSrcDocEmbeds = (scope: ParentNode) =>
    scope.querySelectorAll<HTMLIFrameElement>('iframe[data-yfm-sandbox-mode=srcdoc]');
const findAllShadowContainers = (scope: ParentNode) =>
    scope.querySelectorAll<HTMLDivElement>('div[data-yfm-sandbox-mode=shadow]');
const findAllIFrameEmbeds = (scope: ParentNode) =>
    scope.querySelectorAll<HTMLIFrameElement>('iframe[data-yfm-sandbox-mode=isolated]');

const modeToController: Record<
    EmbeddingMode,
    new (node: HTMLElement, config: IHTMLIFrameElementConfig) => IEmbeddedContentController
> = {
    srcdoc: SrcDocIFrameController,
    shadow: ShadowRootController,
    isolated: EmbeddedIFrameController,
};

// Finds all iframes and creates controllers for each iframe
export class EmbeddedContentRootController extends Disposable {
    private children: Map<string, IEmbeddedContentController> = new Map();
    private config: EmbedsConfig;
    private document: Document;

    constructor(
        document: Document,
        config: EmbedsConfig = {
            classNames: [],
            styles: {},
        },
    ) {
        super();

        this.config = config;
        this.document = document;

        // initialize on DOM ready
        this.document.addEventListener('DOMContentLoaded', () => this.initialize());
        this.dispose.add(() => {
            this.document.removeEventListener('DOMContentLoaded', () => this.initialize());
        });

        this.dispose.add(this.disposeChildren);
    }

    initialize = async (configOverrideForThisInitCycle?: EmbedsConfig) => {
        const dirtyEmbeds = [
            ...findAllSrcDocEmbeds(this.document),
            ...findAllShadowContainers(this.document),
            ...findAllIFrameEmbeds(this.document),
        ].filter(
            (el) =>
                typeof el.dataset.yfmEmbedId !== 'string' ||
                !this.children.has(el.dataset.yfmEmbedId),
        );

        const instantiatedControllers = dirtyEmbeds.map((embed) => {
            const embedId = nanoid();

            const mode = embed.dataset.yfmSandboxMode as EmbeddingMode; // this cast is safe at this point
            const ControllerCtor = modeToController[mode];

            const instance = new ControllerCtor(
                embed,
                configOverrideForThisInitCycle ?? this.config,
            );

            embed.dataset.yfmEmbedId = embedId;
            this.children.set(embedId, instance);

            return instance;
        });

        return Promise.all(instantiatedControllers.map((ctrller) => ctrller.initialize()));
    };

    get blocks(): IEmbeddedContentController[] {
        return Array.from(this.children.values());
    }

    /**
     * Set the config object that will be passed to child embeds during an initialization cycle.
     * Please note that changes made via a call to this method would be only reflected during next initialization cycles.
     * @param config
     * @returns {void}
     */
    setConfig(config: EmbedsConfig) {
        this.config = config;
    }

    forEach(callback: (controller: IEmbeddedContentController) => void) {
        return this.children.forEach((controller) => callback(controller));
    }

    disposeChildren = () => {
        this.children.forEach((controller) => controller.dispose());
        this.children.clear();
    };
}
