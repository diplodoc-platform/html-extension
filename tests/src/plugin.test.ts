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

    it('should render HTML in sandboxed iframe', () => {
        expect(
            html(
                dd`
            :::html
            <div class="html-div">content</div>
            :::
            `,
                {
                    embeddingMode: 'srcdoc',
                    sandbox:
                        'allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-same-origin',
                },
            ),
        ).toMatchSnapshot();
    });

    it('should apply sanitize function', () => {
        expect(
            html(
                dd`
            :::html
            <p>should-be-replaced</p>
            :::
            `,
                {
                    embeddingMode: 'srcdoc',
                    sanitize: (html) => html.replace('should-be-replaced', 'sanitized'),
                },
            ),
        ).toMatchSnapshot();
    });

    it('should apply sanitize head and body functions', () => {
        expect(
            html(
                dd`
            :::html
            <p>replace-head</p>
            <p>replace-body</p>
            :::
            `,
                {
                    embeddingMode: 'srcdoc',
                    head: '<title>replace-head | replace-body</title>',
                    sanitize: {
                        head: (html) => html.replace('replace-head', 'sanitized'),
                        body: (html) => html.replace('replace-body', 'sanitized'),
                    },
                },
            ),
        ).toMatchSnapshot();
    });
});
