import {useMemo} from 'react';
import {
    ControllerCallback,
    IHTMLIFrameElementConfig,
    IHtmlController,
    IHtmlIFrameController,
} from '../types';
import {getScriptStore, useController} from '../common';
import {GLOBAL_SYMBOL} from '../constants';

export type ForEachCallbackArgs = ControllerCallback<IHtmlIFrameController>;
export type SetConfigArgs = IHTMLIFrameElementConfig;

export interface DiplodocHtmlMethods {
    blocks: IHtmlIFrameController[];
    destroy: () => void;
    forEach: (callback: ForEachCallbackArgs) => void;
    reinitialize: () => void;
    resizeAll: () => void;
    setConfig: (config: SetConfigArgs) => void;
}

export function useDiplodocHtml(): DiplodocHtmlMethods | null {
    const store = getScriptStore<IHtmlController>(GLOBAL_SYMBOL);
    const controller = useController<IHtmlController>(store);

    return useMemo(
        () =>
            controller
                ? {
                      blocks: controller.blocks,
                      destroy: () => controller.destroy(),
                      forEach: (callback: ControllerCallback<IHtmlIFrameController>) =>
                          controller.forEach(callback),
                      reinitialize: () => controller.reinitialize(),
                      resizeAll: () => controller.forEach((controller) => controller.resize()),
                      setConfig: (config: IHTMLIFrameElementConfig) => controller.setConfig(config),
                  }
                : null,
        [controller],
    );
}
