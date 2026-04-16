import {describe, expect, it} from 'vitest';

import {htmlBlockDefaultSanitizer} from '../src/utils/sanitize';

describe('htmlBlockDefaultSanitizer', () => {
    describe('head', () => {
        it('preserves line-height inside style (YfmHtmlBlock css whitelist)', () => {
            const input =
                '<base target="_parent"><style>* { font-size: 15px; line-height: 20px; color: #333; }</style>';
            const out = htmlBlockDefaultSanitizer.head(input);

            expect(out).toContain('line-height');
            expect(out).toMatch(/line-height:\s*20px/);
        });

        it('preserves grid/flex-only properties inside style', () => {
            const input =
                '<style>.x { display: flex; gap: 8px; line-height: 1.4; justify-content: center; }</style>';
            const out = htmlBlockDefaultSanitizer.head(input);

            expect(out).toContain('gap');
            expect(out).toContain('justify-content');
            expect(out).toMatch(/line-height:\s*1\.4/);
        });
    });

    describe('body', () => {
        it('preserves line-height inside style', () => {
            const input = '<style>p { line-height: 22px; }</style><p>hi</p>';
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).toMatch(/line-height:\s*22px/);
        });

        it('preserves legitimate iframe with src', () => {
            const input =
                '<iframe src="https://www.test.com/embed/abc" width="560" height="315"></iframe>';
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).toContain('<iframe');
            expect(out).toContain('src="https://www.test.com/embed/abc"');
        });

        it('neutralizes iframe mutation XSS (closing tag inside style)', () => {
            const input =
                "<iframe><style>div{ font-family: '</iframe>1<script src=/x/alert.js></script>' }</style>";
            const out = htmlBlockDefaultSanitizer.body(input);

            const styleContent = out.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] ?? '';
            expect(styleContent).not.toMatch(/<\/iframe/i);

            const withoutStyleBlocks = out.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            expect(withoutStyleBlocks).not.toMatch(/<script[\s>]/i);
        });

        it('strips srcdoc attribute from nested iframes', () => {
            const input = '<iframe srcdoc="<script>alert(1)</script>" width="100"></iframe>';
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).toContain('<iframe');
            expect(out).not.toContain('srcdoc');
        });

        it('strips dangerous closing tags from style content', () => {
            const input = "<style>div { content: '</iframe></script></textarea>' }</style>";
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).not.toMatch(/<\/iframe/i);
            expect(out).not.toMatch(/<\/script/i);
            expect(out).not.toMatch(/<\/textarea/i);
        });

        it('preserves normal CSS inside style tags', () => {
            const input = '<style>.box { display: flex; gap: 8px; color: red; }</style>';
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).toContain('display');
            expect(out).toContain('gap');
            expect(out).toContain('color');
        });

        it('handles unclosed style tag with dangerous content (htmlparser2 auto-closes at EOF)', () => {
            const input = "<style>div { content: '</iframe>oops";
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).not.toMatch(/<script[\s>]/i);
        });

        it('strips script when </style> appears inside CSS string value', () => {
            const input = "<style>div { content: '</style><script>alert(1)</script>'; }</style>";
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).not.toMatch(/<script[\s>]/i);
            expect(out).not.toContain('alert(1)');
        });
    });
});
