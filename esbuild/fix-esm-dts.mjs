#!/usr/bin/env node

// Post-processes build/esm/**/*.d.ts so that imports carry an explicit `.js`
// extension and directory imports resolve to `/index.js`. tsc with
// `moduleResolution: "Bundler"` does not add extensions, but downstream TS
// consumers using `NodeNext`/`Node16` require them on ESM-side declarations
// (error TS2834 / TS2307).

import {existsSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';

const ROOT = 'build/esm';

// Matches `from '<spec>'` / `from "<spec>"` (static imports / re-exports).
const FROM_RE = /(\bfrom\s*)(['"])([^'"]+)\2/g;
// Matches `import('<spec>')` / `import("<spec>")` (dynamic / inlined types).
const DYN_RE = /(\bimport\s*\(\s*)(['"])([^'"]+)\2/g;

// Deep-import specifiers that live inside packages WITHOUT an `exports` map,
// so native ESM deep-import resolution requires an explicit `.js`. Keep this
// list narrow — packages that DO ship `exports` (parse5, node:*) must not be
// rewritten.
const BARE_DEEP_IMPORT_WHITELIST = [/^@diplodoc\/transform\/lib\//];

const hasExtension = (spec) => /\.(?:js|mjs|cjs|json|css)$/.test(spec);
const isRelative = (spec) => spec.startsWith('./') || spec.startsWith('../');

function resolveSpec(fileDir, spec) {
    if (hasExtension(spec)) return spec;

    if (isRelative(spec)) {
        if (existsSync(join(fileDir, spec + '.d.ts'))) return spec + '.js';
        if (existsSync(join(fileDir, spec, 'index.d.ts'))) return spec + '/index.js';
        // Fallback: preserve legacy behaviour. Covers edge cases where the
        // target file is emitted under a different name (rare in this repo).
        return spec + '.js';
    }

    // Bare specifier. Only rewrite known deep-import shapes; root/package-name
    // imports and packages with an `exports` map must be left untouched.
    if (BARE_DEEP_IMPORT_WHITELIST.some((re) => re.test(spec))) {
        return spec + '.js';
    }

    return spec;
}

function rewrite(src, fileDir) {
    const replacer = (_m, lead, quote, spec) => {
        const out = resolveSpec(fileDir, spec);
        return `${lead}${quote}${out}${quote}`;
    };
    return src.replace(FROM_RE, replacer).replace(DYN_RE, replacer);
}

function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        const s = statSync(p);
        if (s.isDirectory()) {
            walk(p);
        } else if (p.endsWith('.d.ts')) {
            const before = readFileSync(p, 'utf8');
            const after = rewrite(before, dirname(p));
            if (after !== before) {
                writeFileSync(p, after);
            }
        }
    }
}

try {
    statSync(ROOT);
} catch {
    console.error(`[fix-esm-dts] ${ROOT} does not exist — run build:declarations:esm first.`);
    process.exit(1);
}

walk(ROOT);
