import {nanoid} from 'nanoid';

import {EmbeddingMode, EmbedsConfig, HTMLRuntimeConfig} from '../types';
import {Disposable} from '../utils';
import {HTML_RUNTIME_CONFIG_SYMBOL} from '../constants';

import {EmbeddedIFrameController} from './EmbeddedIFrameController';
import {IEmbeddedContentController} from './IEmbeddedContentController';
import {ShadowRootController} from './ShadowRootController';
import {SrcDocIFrameController} from './SrcDocIFrameController';

import {IHTMLIFrameElementConfig} from '.';

const findAllSrcDocEmbeds = (scope: ParentNode) =>
    scope.querySelectorAll<HTMLIFrameElement>('iframe[data-yfm-sandbox-mode=srcdoc]');
const findAllShadowContainers = (scope: ParentNode) =>
    scope.querySelectorAll<HTMLDivElement>('div[data-yfm-sandbox-mode=shadow]');
const findAllIFrameEmbeds = (scope: ParentNode) =>
    scope.querySelectorAll<HTMLIFrameElement>('iframe[data-yfm-sandbox-mode=isolated]');

const embedFinders: Record<EmbeddingMode, (scope: ParentNode) => NodeListOf<HTMLElement>> = {
    srcdoc: findAllSrcDocEmbeds,
    shadow: findAllShadowContainers,
    isolated: findAllIFrameEmbeds,
};

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
    private runtimeConfig: HTMLRuntimeConfig;

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
        this.runtimeConfig = window[HTML_RUNTIME_CONFIG_SYMBOL] || {};

        // initialize on DOM ready
        this.document.addEventListener('DOMContentLoaded', () => this.initialize());
        this.dispose.add(() => {
            this.document.removeEventListener('DOMContentLoaded', () => this.initialize());
        });

        this.dispose.add(() => this.disposeChildren());
    }

    initialize = async (configOverrideForThisInitCycle?: EmbedsConfig) => {
        const {disabledModes} = this.runtimeConfig;

        // MAJOR: separate runtime controllers and chunks, so the consumer could
        // import only one runtime mode: import('@diplodoc/html-extension/runtime/srcdoc');
        const embeds = Object.keys(embedFinders).reduce<HTMLElement[]>((result, current) => {
            const modeKey = current as EmbeddingMode;

            if (!disabledModes?.includes(modeKey)) {
                return result.concat(...embedFinders[modeKey](this.document));
            }

            return result;
        }, []);

        const dirtyEmbeds = embeds.filter(
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
