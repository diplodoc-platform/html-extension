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
    });
});
