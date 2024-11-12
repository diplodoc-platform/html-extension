import MarkdownIt from 'markdown-it';
import transform from '@diplodoc/transform';
import dd from 'ts-dedent';

import {type PluginOptions, transform as htmlTransform} from '../../src/plugin';

const html = (text: string, opts?: Partial<PluginOptions>) => {
    return transform(text, {
        needToSanitizeHtml: false,
        plugins: [htmlTransform({bundle: false, ...opts})],
    }).result.html;
};

const tokens = (text: string, opts?: Partial<PluginOptions>) => {
    const md = new MarkdownIt().use(htmlTransform({bundle: false, ...opts}));
    return md.parse(text, {});
};

describe('HTML extension – plugin', () => {
    it('should render html block', () => {
        expect(
            html(
                dd`
            :::html
            <div class="html-div">content</div>
            :::
            `,
                {embeddingMode: 'srcdoc'},
            ),
        ).toMatchSnapshot();
    });

    it('should generate html token', () => {
        expect(
            tokens(
                dd`


            :::html
            <div class="html-div">content</div>
            :::
            `,
                {embeddingMode: 'srcdoc'},
            ),
        ).toMatchSnapshot();
    });
});
