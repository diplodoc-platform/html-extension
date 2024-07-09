import {useMemo} from 'react';
import {ControllerCallback, IHtmlController, IHtmlIFrameController} from '../types';
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
                      forEach: (callback: ControllerCallback<IHtmlIFrameController>) =>
                          controller.forEach(callback),
                      reinitialize: () => controller.reinitialize(),
                      resizeAll: () => controller.forEach((controller) => controller.resize()),
                  }
                : null,
        [controller],
    );
}
