import {APIPublisherBlueprint, InferExposedAPIFromBlueprint} from '../rpcAdapter/publisher';
import {IFrameController} from './IFrameController';

export const apiBlueprintFromController = (controller: IFrameController) =>
    ((builder) =>
        builder
            .call('setStyles', controller.setStyles.bind(controller))
            .call('setClassNames', controller.setClassNames.bind(controller))
            .call('replaceHTML', controller.replaceHTML.bind(controller))
            .call('setBaseTarget', controller.setBaseTarget.bind(controller))
            .eventSource(
                'resizedToNewHeight',
                controller.onContentResize.bind(controller),
            )) satisfies APIPublisherBlueprint;

export type IFrameControllerRPCAPI = InferExposedAPIFromBlueprint<
    ReturnType<typeof apiBlueprintFromController>
>;
