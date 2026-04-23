#!/usr/bin/env node

import {build, sassPlugin} from '@diplodoc/lint/esbuild';
import {htmlPlugin} from '@craftamap/esbuild-plugin-html';
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve as resolvePath} from 'node:path';

import pkg from '../package.json' with {type: 'json'};
import tsConfig from '../tsconfig.json' with {type: 'json'};

/** @type {import('esbuild').BuildOptions} */
const common = {
    bundle: true,
    sourcemap: true,
    target: tsConfig.compilerOptions.target,
    tsconfig: './tsconfig.publish.json',
};

const shimPlugin = (fmt) => ({
    name: 'require-shim-switch',
    setup(pluginBuild) {
        pluginBuild.onResolve({filter: /^\.\/require-shim$/}, (args) => ({
            path: resolvePath(args.resolveDir, `require-shim.${fmt}.ts`),
        }));
    },
});

const pluginExternalCjs = ['@diplodoc/transform', 'markdown-it', '@diplodoc/directive'];

/**
 * @typedef {{
 *   name: string,
 *   entry: string,
 *   platform: 'node' | 'browser' | 'neutral',
 *   minify?: boolean,
 *   target?: string,
 *   external?: string[],
 *   plugins?: import('esbuild').Plugin[],
 *   define?: Record<string, string>,
 * }} Entry
 */

/** @type {Entry[]} */
const entries = [
    {
        name: 'plugin',
        entry: 'src/plugin/index.ts',
        platform: 'node',
        define: {PACKAGE: JSON.stringify(pkg.name)},
    },
    {
        name: 'react',
        entry: 'src/react/index.ts',
        platform: 'neutral',
        external: ['react'],
        target: 'es6',
    },
    {
        name: 'utils',
        entry: 'src/utils/index.ts',
        platform: 'browser',
        minify: true,
    },
];

const builds = [];

for (const e of entries) {
    for (const fmt of ['esm', 'cjs']) {
        /** @type {import('esbuild').BuildOptions} */
        const opts = {
            ...common,
            entryPoints: [e.entry],
            outfile: `build/${fmt}/${e.name}/index.js`,
            format: fmt,
            platform: e.platform,
            plugins: [...(e.plugins ?? [])],
        };

        if (e.minify) opts.minify = true;
        if (e.target) opts.target = e.target;
        if (e.define) opts.define = e.define;

        if (e.name === 'plugin') {
            // Plugin is Node-only. Switch require-shim implementation per format.
            opts.plugins.push(shimPlugin(fmt));

            if (fmt === 'esm') {
                // ESM: keep all deps external (parse5 imported natively as ESM).
                opts.packages = 'external';
                // __dirname is not defined in native ESM. Inject a banner
                // that derives it from import.meta.url so Node-side code
                // (copyRuntimeFiles) keeps working.
                opts.banner = {
                    js:
                        "import { fileURLToPath as __efu } from 'node:url';" +
                        "import { dirname as __edn } from 'node:path';" +
                        'const __filename = __efu(import.meta.url);' +
                        'const __dirname = __edn(__filename);',
                };
            } else {
                // CJS: bundle parse5 (it is ESM-only, cannot be required).
                // Peer deps stay external.
                opts.external = pluginExternalCjs;
            }
        } else if (e.external) {
            opts.external = e.external;
        }

        builds.push(build(opts));
    }
}

// runtime — классический browser-script, грузится через <script src> (IIFE).
// Отдельная сборка вне ESM/CJS-цикла: dual-формат для runtime некорректен —
// его потребитель не Node-модуль, а тег <script> в iframe'е.
builds.push(
    build({
        ...common,
        entryPoints: ['src/runtime/index.ts'],
        outfile: 'build/runtime/index.js',
        format: 'iife',
        platform: 'browser',
        minify: true,
        plugins: [sassPlugin()],
    }),
);

// iframe — статичный HTML asset, собирается единожды.
builds.push(
    build({
        ...common,
        entryPoints: ['src/iframe/index.ts'],
        sourcemap: false,
        minify: true,
        platform: 'browser',
        metafile: true,
        outdir: 'build/iframe/',
        plugins: [
            htmlPlugin({
                files: [
                    {
                        filename: 'runtime.html',
                        entryPoints: ['src/iframe/index.ts'],
                        inline: true,
                    },
                ],
            }),
        ],
    }),
);

await Promise.all(builds);

mkdirSync('build/esm', {recursive: true});
mkdirSync('build/cjs', {recursive: true});
writeFileSync(
    'build/esm/package.json',
    JSON.stringify({type: 'module', sideEffects: false}, null, 2) + '\n',
);
writeFileSync(
    'build/cjs/package.json',
    JSON.stringify({type: 'commonjs', sideEffects: false}, null, 2) + '\n',
);
