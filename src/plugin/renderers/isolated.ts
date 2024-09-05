import {RenderRule} from 'markdown-it/lib/renderer';

import {
    DATAATTR_ISOLATED_SANDBOX_BASE_TARGET,
    DATAATTR_ISOLATED_SANDBOX_PREFERRED_HOST,
    DATAATTR_SANDBOX_CONTENT,
    DATAATTR_SANDBOX_MODE,
} from '../../constants';

import {RenderRuleFactoryOptions} from './defs';

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

        const processedContent = embedContentTransformFn?.(token.content) ?? token.content;

        if (containerClassNames.length) {
            token.attrSet('class', containerClassNames);
        }

        token.attrSet('frameborder', '0');
        token.attrSet('style', 'width:100%');
        token.attrSet(DATAATTR_SANDBOX_MODE, 'isolated');
        token.attrSet(DATAATTR_SANDBOX_CONTENT, processedContent);
        token.attrSet(DATAATTR_ISOLATED_SANDBOX_BASE_TARGET, baseTarget);

        if (typeof isolatedSandboxHost === 'string') {
            token.attrSet(DATAATTR_ISOLATED_SANDBOX_PREFERRED_HOST, isolatedSandboxHost);
        }

        return `<iframe ${self.renderAttrs(token)}></iframe>`;
    };
