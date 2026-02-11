/**
 * Snapshot serializer that pretty-prints HTML for readable diffs.
 * Formats HTML so each attribute is on its own line (like the old jest-serializer-html).
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jsBeautify = require('js-beautify') as {html: (s: string, opts: object) => string};

function isHtmlString(val: unknown): val is string {
    return typeof val === 'string' && val.trim().startsWith('<');
}

export default {
    test(val: unknown) {
        return isHtmlString(val);
    },
    serialize(
        val: unknown,
        _config: unknown,
        indentation: string,
        _depth: number,
        _refs: unknown,
        _printer: unknown,
    ) {
        const html = String(val);
        const formatted = jsBeautify.html(html, {
            indent_size: 2,
            wrap_attributes: 'force',
            wrap_line_length: 0,
        });
        const lines = formatted.trim().split('\n');
        return lines.map((line) => indentation + line).join('\n');
    },
};
