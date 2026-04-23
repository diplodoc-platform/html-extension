import {existsSync, mkdtempSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, join, relative, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
import {beforeAll, describe, expect, it} from 'vitest';

const root = resolve(__dirname, '..');
const esmRoot = resolve(root, 'build/esm');
const cjsRoot = resolve(root, 'build/cjs');
const esmEntry = resolve(root, 'build/esm/plugin/index.js');
const cjsEntry = resolve(root, 'build/cjs/plugin/index.js');
const esmReactEntry = resolve(root, 'build/esm/react/index.js');
const cjsReactEntry = resolve(root, 'build/cjs/react/index.js');
const esmUtilsEntry = resolve(root, 'build/esm/utils/index.js');
const cjsUtilsEntry = resolve(root, 'build/cjs/utils/index.js');
const esmPluginDts = resolve(root, 'build/esm/plugin/index.d.ts');
const runtimeBundle = resolve(root, 'build/runtime/index.js');
const pkgPath = resolve(root, 'package.json');

const req = createRequire(import.meta.url);

// Expected public names for plugin entry (keep in sync with src/plugin/index.ts).
const PLUGIN_EXPECTED_KEYS = [
    'buildYfmHtmlBlockOptions',
    'getStyles',
    'htmlBlockDefaultSanitizer',
    'transform',
    'yfmHtmlBlockOptions',
].sort();

const REACT_EXPECTED_NAMES = [
    'useDiplodocEmbeddedContentController',
    'useDiplodocEmbeddedContent',
    'EmbeddedContentRuntime',
];

const UTILS_EXPECTED_NAMES = ['TaskQueue', 'setupRuntimeConfig', 'timeout', 'Disposable'];

// Bare specifiers that ship without an `exports` map, so native ESM deep-import
// resolution requires an explicit `.js`. Keep in sync with
// BARE_DEEP_IMPORT_WHITELIST in esbuild/fix-esm-dts.mjs.
const BARE_DEEP_IMPORT_WHITELIST = [/^@diplodoc\/transform\/lib\//];

const KNOWN_EXTENSIONS = /\.(?:js|mjs|cjs|json|css)$/;

function listDts(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        const s = statSync(p);
        if (s.isDirectory()) out.push(...listDts(p));
        else if (p.endsWith('.d.ts')) out.push(p);
    }
    return out;
}

interface Offender {
    file: string;
    spec: string;
    reason: string;
}

function collectDtsImportOffenders(dtsFiles: string[]): Offender[] {
    const offenders: Offender[] = [];
    // Matches `from '<spec>'`, `from "<spec>"`, `import('<spec>')`, `import("<spec>")`.
    const re = /(?:\bfrom\s*|\bimport\s*\(\s*)(['"])([^'"]+)\1/g;

    for (const file of dtsFiles) {
        const src = readFileSync(file, 'utf8');
        const fileDir = dirname(file);

        for (const m of src.matchAll(re)) {
            const spec = m[2];

            if (spec === '.' || spec === '..') {
                offenders.push({
                    file,
                    spec,
                    reason: 'self-reference does not resolve under NodeNext',
                });
                continue;
            }

            const isRelative = spec.startsWith('./') || spec.startsWith('../');

            if (isRelative) {
                if (!KNOWN_EXTENSIONS.test(spec)) {
                    offenders.push({file, spec, reason: 'relative spec missing .js extension'});
                    continue;
                }
                // Strip known extension and resolve physically. `.js` -> `.d.ts`.
                const withoutExt = spec.replace(/\.(?:js|mjs|cjs)$/, '');
                const asFile = join(fileDir, withoutExt + '.d.ts');
                if (!existsSync(asFile) && !spec.endsWith('.json') && !spec.endsWith('.css')) {
                    offenders.push({
                        file,
                        spec,
                        reason: `resolved .d.ts does not exist (${relative(root, asFile)})`,
                    });
                }
            } else if (BARE_DEEP_IMPORT_WHITELIST.some((w) => w.test(spec))) {
                if (!KNOWN_EXTENSIONS.test(spec)) {
                    offenders.push({
                        file,
                        spec,
                        reason: 'whitelisted deep-import bare spec missing .js extension',
                    });
                }
            }
            // Other bare specifiers: skip. Packages with their own `exports` map
            // (parse5, node:*, markdown-it with types) don't need `.js`.
        }
    }
    return offenders;
}

describe('built bundles (post-build regression guard)', () => {
    beforeAll(() => {
        for (const p of [
            esmEntry,
            cjsEntry,
            esmReactEntry,
            cjsReactEntry,
            esmUtilsEntry,
            cjsUtilsEntry,
            esmPluginDts,
            runtimeBundle,
        ]) {
            if (!existsSync(p)) {
                throw new Error(
                    `Built artefact missing: ${p}. Run \`npm run build\` before this suite.`,
                );
            }
        }
    });

    describe('plugin ESM bundle', () => {
        it('exposes named + default exports, default mirrors namespace', async () => {
            const mod = await import(pathToFileURL(esmEntry).href);

            expect(typeof mod.transform).toBe('function');
            expect(typeof mod.getStyles).toBe('function');
            expect(mod.default).toBeDefined();
            expect(mod.default.transform).toBe(mod.transform);
            expect(mod.default.getStyles).toBe(mod.getStyles);
        });

        it('default object keys match the full named-export surface', async () => {
            const mod = await import(pathToFileURL(esmEntry).href);
            const named = Object.keys(mod)
                .filter((k) => k !== 'default')
                .sort();
            const defaultKeys = Object.keys(mod.default).sort();

            expect(named).toEqual(PLUGIN_EXPECTED_KEYS);
            expect(defaultKeys).toEqual(PLUGIN_EXPECTED_KEYS);
        });

        it('does not leak bare __dirname after esbuild banner (regression #2)', () => {
            const src = readFileSync(esmEntry, 'utf8');
            const bannerMatch = /const __dirname = __edn\(__filename\);/.test(src);
            expect(bannerMatch, 'banner must define __dirname').toBe(true);
        });
    });

    describe('plugin CJS bundle', () => {
        it('exposes named + default exports via require()', () => {
            const cjs = req(cjsEntry);

            expect(typeof cjs.transform).toBe('function');
            expect(cjs.default).toBeDefined();
            expect(cjs.default.transform).toBe(cjs.transform);
        });

        it('default object keys match the full named-export surface', () => {
            const cjs = req(cjsEntry);
            const named = Object.keys(cjs)
                .filter((k) => k !== 'default' && k !== '__esModule')
                .sort();
            const defaultKeys = Object.keys(cjs.default).sort();

            expect(named).toEqual(PLUGIN_EXPECTED_KEYS);
            expect(defaultKeys).toEqual(PLUGIN_EXPECTED_KEYS);
        });
    });

    describe('ESM .d.ts contract (NodeNext-compatible)', () => {
        // Node ESM + moduleResolution: NodeNext requires explicit `.js` on
        // relative imports, `/index.js` on directory imports, and refuses
        // self-references (`import(".")`). tsc with moduleResolution: Bundler
        // does not produce these — esbuild/fix-esm-dts.mjs rewrites post-build.
        //
        // This guard covers the WHOLE build/esm tree, not just plugin/, and
        // matches both `from '…'` and `import('…')` (inlined type expressions).
        it('every .d.ts under build/esm has valid import specifiers', () => {
            const dts = listDts(esmRoot);
            expect(dts.length, 'should find .d.ts files under build/esm').toBeGreaterThan(0);

            const offenders = collectDtsImportOffenders(dts);

            expect(
                offenders,
                'invalid import specifiers found:\n' +
                    offenders
                        .map((o) => `  ${relative(root, o.file)}: '${o.spec}' — ${o.reason}`)
                        .join('\n'),
            ).toEqual([]);
        });
    });

    describe('require-shim type surface', () => {
        // Previous revisions declared `export const dynrequire: NodeRequire`,
        // which leaked an ambient type from @types/node into published .d.ts
        // — consumers without @types/node would hit TS2304 under
        // skipLibCheck: false.
        it('does not leak NodeRequire ambient type', () => {
            for (const fmt of ['esm', 'cjs'] as const) {
                const p = resolve(root, `build/${fmt}/plugin/require-shim.d.ts`);
                const src = readFileSync(p, 'utf8');
                expect(src, `${fmt} shim must not reference NodeRequire ambient`).not.toMatch(
                    /\bNodeRequire\b/,
                );
            }
        });
    });

    describe('require-shim alias wiring', () => {
        // The esbuild onResolve plugin rewrites `./require-shim` at build time.
        // If that ever fails silently, the stub's fallback throw will ship in
        // the final bundle and plugins will crash at runtime. Cheap gate.
        it('built plugin bundles do not contain the unapplied-stub error', () => {
            for (const p of [esmEntry, cjsEntry]) {
                const src = readFileSync(p, 'utf8');
                expect(src, `${relative(root, p)} must not ship the fallback throw`).not.toContain(
                    'require-shim: alias was not applied during build',
                );
            }
        });
    });

    describe('react subpath bundles', () => {
        it('ESM bundle has top-level export statements and declared names', () => {
            const src = readFileSync(esmReactEntry, 'utf8');
            expect(src).toMatch(/^export\b/m);
            for (const name of REACT_EXPECTED_NAMES) {
                expect(src, `ESM bundle must export "${name}"`).toContain(name);
            }
        });

        it('CJS bundle uses module.exports / exports and declared names', () => {
            const src = readFileSync(cjsReactEntry, 'utf8');
            expect(src).toMatch(/\b(?:module\.exports|exports\.)\b/);
            for (const name of REACT_EXPECTED_NAMES) {
                expect(src, `CJS bundle must expose "${name}"`).toContain(name);
            }
        });
    });

    describe('utils subpath bundles', () => {
        it('ESM bundle is parseable ESM and contains declared names', () => {
            const src = readFileSync(esmUtilsEntry, 'utf8');
            // utils is minified; match a bare `export {…}` anywhere.
            expect(src).toMatch(/\bexport\s*\{/);
            for (const name of UTILS_EXPECTED_NAMES) {
                expect(src, `ESM bundle must export "${name}"`).toContain(name);
            }
        });

        it('CJS bundle uses module.exports / exports and contains declared names', () => {
            const src = readFileSync(cjsUtilsEntry, 'utf8');
            expect(src).toMatch(/\b(?:module\.exports|exports\.)\b/);
            for (const name of UTILS_EXPECTED_NAMES) {
                expect(src, `CJS bundle must expose "${name}"`).toContain(name);
            }
        });
    });

    describe('runtime bundle (classic browser script)', () => {
        it('has no top-level ESM export or CJS module.exports', () => {
            const src = readFileSync(runtimeBundle, 'utf8');

            expect(src).not.toMatch(/^export\b/m);
            expect(src).not.toMatch(/\bmodule\.exports\b/);
        });

        it('parses as a classic script (IIFE-style)', () => {
            const src = readFileSync(runtimeBundle, 'utf8');
            expect(() => new vm.Script(src)).not.toThrow();
        });
    });

    describe('bundle:true end-to-end (regression #1 + #2)', () => {
        it('ESM plugin copies runtime file from disk without __dirname crash', async () => {
            const mod = await import(pathToFileURL(esmEntry).href);
            const destRoot = mkdtempSync(join(tmpdir(), 'htmlext-esm-'));
            const runtimeJsPath = '_assets/html-extension.js';

            const plugin = mod.transform({
                bundle: true,
                runtimeJsPath,
                embeddingMode: 'srcdoc',
                isolatedSandboxHost: '',
            });

            expect(() =>
                plugin.collect('::: html\n<div>ok</div>\n:::\n', {destRoot}),
            ).not.toThrow();

            const copied = join(destRoot, runtimeJsPath);
            expect(existsSync(copied)).toBe(true);
            const contents = readFileSync(copied, 'utf8');
            expect(contents).not.toMatch(/^export\b/m);
            expect(contents).not.toMatch(/\bmodule\.exports\b/);
        });

        it('CJS plugin copies runtime file with the same contract', () => {
            const destRoot = mkdtempSync(join(tmpdir(), 'htmlext-cjs-'));
            const runtimeJsPath = '_assets/html-extension.js';
            const plugin = req(cjsEntry).transform({
                bundle: true,
                runtimeJsPath,
                embeddingMode: 'srcdoc',
                isolatedSandboxHost: '',
            });

            plugin.collect('::: html\n<div>ok</div>\n:::\n', {destRoot});

            expect(existsSync(join(destRoot, runtimeJsPath))).toBe(true);
            expect(readdirSync(destRoot)).toContain('_assets');
        });
    });

    describe('package.json metadata', () => {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

        it('declares runtime as side-effectful (regression #4)', () => {
            expect(Array.isArray(pkg.sideEffects)).toBe(true);
            expect(pkg.sideEffects).toContain('./build/runtime/index.js');
        });

        it('runtime export resolves to the IIFE bundle, not dual ESM/CJS', () => {
            expect(pkg.exports['./runtime'].default).toBe('./build/runtime/index.js');
            expect(pkg.exports['./runtime'].import).toBeUndefined();
            expect(pkg.exports['./runtime'].require).toBeUndefined();
        });

        // The `./runtime` subpath exports deprecated (TS-only) types that
        // remain available during the deprecation window. The IIFE bundle is
        // still the sole runtime target, so import/require must not be set —
        // only the types hint for existing TS consumers.
        it('advertises deprecated types for ./runtime without an ESM/CJS split', () => {
            expect(pkg.exports['./runtime'].types).toBe('./build/esm/runtime/index.d.ts');
            expect(pkg.typesVersions?.['*']?.runtime).toEqual(['./build/esm/runtime/index.d.ts']);
        });

        it('declares engines.node baseline for ESM support', () => {
            expect(pkg.engines?.node).toBeDefined();
        });
    });

    describe('per-format virtual package.json', () => {
        // Bundlers treat build/{esm,cjs}/ as nested packages via these files;
        // sideEffects: false is needed so consumers can tree-shake plugin/
        // react/ utils/. The root sideEffects array keeps runtime live.
        it('both formats declare "type" and sideEffects: false', () => {
            for (const fmt of ['esm', 'cjs'] as const) {
                const raw = readFileSync(resolve(root, `build/${fmt}/package.json`), 'utf8');
                const pkg = JSON.parse(raw);
                expect(pkg.type, `build/${fmt}/package.json must set "type"`).toBe(
                    fmt === 'esm' ? 'module' : 'commonjs',
                );
                expect(
                    pkg.sideEffects,
                    `build/${fmt}/package.json must declare sideEffects: false`,
                ).toBe(false);
            }
        });

        it('root package.json keeps runtime in sideEffects array', () => {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
            expect(pkg.sideEffects).toContain('./build/runtime/index.js');
        });
    });

    describe('CJS .d.ts contract', () => {
        // CJS .d.ts doesn't need `.js` rewriting (tsc with moduleResolution:
        // Node emits without extensions for `require()`-flavored resolution),
        // but it should still be free of self-references / broken bare deep
        // imports that are tested elsewhere.
        it('has no self-reference imports', () => {
            const dts = listDts(cjsRoot);
            const re = /(?:\bfrom\s*|\bimport\s*\(\s*)(['"])([^'"]+)\1/g;
            const offenders: string[] = [];
            for (const file of dts) {
                const src = readFileSync(file, 'utf8');
                for (const m of src.matchAll(re)) {
                    if (m[2] === '.' || m[2] === '..') {
                        offenders.push(`${relative(root, file)}: '${m[2]}'`);
                    }
                }
            }
            expect(offenders, `self-references found:\n${offenders.join('\n')}`).toEqual([]);
        });
    });
});
