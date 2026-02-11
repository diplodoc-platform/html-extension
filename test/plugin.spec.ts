import MarkdownIt from 'markdown-it';
import dd from 'ts-dedent';
import {describe, expect, it} from 'vitest';

import {type PluginOptions, transform as htmlTransform} from '../src/plugin';

function html(text: string, opts?: Partial<PluginOptions>) {
    const md = new MarkdownIt().use(htmlTransform({bundle: false, ...opts}));
    return md.render(text);
}

function tokens(text: string, opts?: Partial<PluginOptions>) {
    const md = new MarkdownIt().use(htmlTransform({bundle: false, ...opts}));
    return md.parse(text, {});
}

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
                    sanitize: (h) => h.replace('should-be-replaced', 'sanitized'),
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
                        head: (h) => h.replace('replace-head', 'sanitized'),
                        body: (h) => h.replace('replace-body', 'sanitized'),
                    },
                },
            ),
        ).toMatchSnapshot();
    });
});

describe('HTML extension – plugin with special characters', () => {
    it('should render html block with dash in first line', () => {
        expect(
            html(
                dd`
            :::html
            -
            <div class="html-div">content with dash in first line</div>
            :::
            `,
                {embeddingMode: 'srcdoc'},
            ),
        ).toMatchSnapshot();
    });

    it('should render html block with equals sign in first line', () => {
        expect(
            html(
                dd`
            :::html
            =
            <div class="html-div">content with equals sign in first line</div>
            :::
            `,
                {embeddingMode: 'srcdoc'},
            ),
        ).toMatchSnapshot();
    });
});

describe('HTML extension – plugin default sanitize', () => {
    it('should remove foreignObject tag', () => {
        expect(
            html(
                dd`
            :::html
                <svg><style><foreignObject><iframe srcdoc='<script/src=https://some.com></script>'>
            :::
            `,
                {embeddingMode: 'srcdoc'},
            ),
        ).toMatchSnapshot();
    });

    it('should remove script tag', () => {
        expect(
            html(
                dd`
            :::html
                <svg><style><script>a</script></style></svg>
            :::
            `,
                {embeddingMode: 'srcdoc'},
            ),
        ).toMatchSnapshot();
    });

    it('should remove script inside template tag', () => {
        expect(
            html(
                dd`
            :::html
                <template id="template"><svg><style> \* <script href="https://some.com"></script></style></svg></template>
            :::
            `,
                {embeddingMode: 'srcdoc'},
            ),
        ).toMatchSnapshot();
    });
});
