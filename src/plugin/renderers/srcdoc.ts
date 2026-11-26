import type {RendererRule} from 'markdown-it';
import type {RenderRuleFactoryOptions} from './defs';

import {DATAATTR_SANDBOX_MODE} from '../../constants';

export const makeSrcdocModeEmbedRenderRule =
    ({
        embedContentTransformFn,
        containerClassNames = '',
        sandbox,
    }: RenderRuleFactoryOptions): RendererRule =>
    (tokens, idx, _opts, _env, self) => {
        const token = tokens[idx];

        const processedContent = embedContentTransformFn?.(token.content) ?? token.content;

        if (containerClassNames.length) {
            token.attrSet('class', containerClassNames);
        }

        token.attrSet('srcdoc', processedContent);
        token.attrSet('frameborder', '0');
        token.attrSet('style', 'width:100%');
        token.attrSet(DATAATTR_SANDBOX_MODE, 'srcdoc');

        if (sandbox) {
            token.attrSet('sandbox', sandbox === true ? '' : sandbox);
        }

        return `<iframe ${self.renderAttrs(token)}></iframe>`;
    };
