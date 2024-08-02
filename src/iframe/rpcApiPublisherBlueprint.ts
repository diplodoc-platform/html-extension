import {APIPublisherBlueprint, InferExposedAPIFromBlueprint} from '../rpcAdapter/publisher';
import {HtmlIFrameController} from './HtmlIFrameController';

export const apiBlueprintFromController = (controller: HtmlIFrameController) =>
    ((builder) =>
        builder
            .call('setStyles', controller.setStyles.bind(controller))
            .call('setClassNames', controller.setClassNames.bind(controller))
            .eventSource(
                'resizedToNewHeight',
                controller.onContentResize.bind(controller),
            )) satisfies APIPublisherBlueprint;

export type IFrameControllerRPCAPI = InferExposedAPIFromBlueprint<
    ReturnType<typeof apiBlueprintFromController>
>;
