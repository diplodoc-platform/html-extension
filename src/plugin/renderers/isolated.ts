import {RenderRule} from 'markdown-it/lib/renderer';
import {RenderRuleFactoryOptions} from './defs';
import {
    DATAATTR_ISOLATED_SANDBOX_BASE_TARGET,
    DATAATTR_SANDBOX_CONTENT,
    DATAATTR_SANDBOX_MODE,
} from '../../constants';

type IsolatedModeEmbedOptions = {
    baseTarget: string;
    isolatedSandboxHost?: string;
};

export const makeIsolatedModeEmbedRenderRule =
    ({
        embedContentTransformFn,
        baseTarget,
        isolatedSandboxHost,
        containerClassNames = '',
    }: RenderRuleFactoryOptions & IsolatedModeEmbedOptions): RenderRule =>
    (tokens, idx, _opts, _env, self) => {
        const token = tokens[idx];

        if (typeof isolatedSandboxHost !== 'string') {
            throw new Error(
                'Please provide `isolatedSandboxHost` plugin option to use the `isolated` HTML sandboxing mode.',
            );
        }

        const processedContent = embedContentTransformFn?.(token.content) ?? token.content;

        if (containerClassNames.length) {
            token.attrSet('class', containerClassNames);
        }

        token.attrSet('src', isolatedSandboxHost);
        token.attrSet('frameborder', '0');
        token.attrSet('style', 'width:100%');
        token.attrSet(DATAATTR_SANDBOX_MODE, 'isolated');
        token.attrSet(DATAATTR_SANDBOX_CONTENT, processedContent);
        token.attrSet(DATAATTR_ISOLATED_SANDBOX_BASE_TARGET, baseTarget);

        return `<iframe ${self.renderAttrs(token)}></iframe>`;
    };
