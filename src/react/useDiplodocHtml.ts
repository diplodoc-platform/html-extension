import {useMemo} from 'react';
import {
    ControllerCallback,
    IHTMLIFrameElementConfig,
    IHtmlController,
    IHtmlIFrameController,
} from '../types';
import {getScriptStore, useController} from '../common';
import {GLOBAL_SYMBOL} from '../constants';

export function useDiplodocHtml() {
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

export type ForEachCallback = (callback: ControllerCallback<IHtmlIFrameController>) => void;
export type ForEachCallbackArgs = ControllerCallback<IHtmlIFrameController>;
export type SetConfigCallback = (config: IHTMLIFrameElementConfig) => void;
export type SetConfigCallbackArgs = IHTMLIFrameElementConfig;
