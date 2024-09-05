import {RenderRule} from 'markdown-it/lib/renderer';

import {DATAATTR_SANDBOX_CONTENT, DATAATTR_SANDBOX_MODE} from '../../constants';

import {RenderRuleFactoryOptions} from './defs';

export const makeShadowModeEmbedRenderRule =
    ({embedContentTransformFn, containerClassNames = ''}: RenderRuleFactoryOptions): RenderRule =>
    (tokens, idx, _opts, _env, self) => {
        const token = tokens[idx];

        const processedContent = embedContentTransformFn?.(token.content) ?? token.content;

        if (containerClassNames.length) {
            token.attrSet('class', containerClassNames);
        }

        token.attrSet('style', 'width:100%;all:initial;');
        token.attrSet(DATAATTR_SANDBOX_MODE, 'shadow');
        token.attrSet(DATAATTR_SANDBOX_CONTENT, processedContent);

        return `<div ${self.renderAttrs(token)}></div>`;
    };
