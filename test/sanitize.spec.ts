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
            expect(out).toContain('width="560"');
            expect(out).toContain('height="315"');
        });

        it('neutralizes iframe mutation XSS (closing tag inside style)', () => {
            const input =
                "<iframe><style>div{ font-family: '</iframe>1<script src=/x/alert.js></script>' }</style>";
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).not.toContain('<script');
            expect(out).not.toMatch(/<script[\s>]/i);
        });

        it('strips srcdoc attribute from nested iframes', () => {
            const input = '<iframe srcdoc="<script>alert(1)</script>" width="100"></iframe>';
            const out = htmlBlockDefaultSanitizer.body(input);

            expect(out).toContain('<iframe');
            expect(out).not.toContain('srcdoc');
        });
    });
});
