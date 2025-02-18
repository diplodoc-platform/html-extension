import {RenderRule} from 'markdown-it/lib/renderer';

import {DATAATTR_SANDBOX_MODE} from '../../constants';

import {RenderRuleFactoryOptions} from './defs';

export const makeSrcdocModeEmbedRenderRule =
    ({
        embedContentTransformFn,
        containerClassNames = '',
        sandbox,
    }: RenderRuleFactoryOptions): RenderRule =>
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
