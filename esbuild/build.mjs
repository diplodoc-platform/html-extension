#!/usr/bin/env node

import {build, sassPlugin} from '@diplodoc/lint/esbuild';
import {htmlPlugin} from '@craftamap/esbuild-plugin-html';

import pkg from '../package.json' with {type: 'json'};
import tsConfig from '../tsconfig.json' with {type: 'json'};

/** @type {import('esbuild').BuildOptions} */
const common = {
    bundle: true,
    sourcemap: true,
    target: tsConfig.compilerOptions.target,
    tsconfig: './tsconfig.publish.json',
};

build({
    ...common,
    entryPoints: ['src/utils/index.ts'],
    outfile: 'build/utils/index.js',
    minify: true,
    platform: 'browser',
    format: 'cjs',
});

build({
    ...common,
    entryPoints: ['src/runtime/index.ts'],
    outfile: 'build/runtime/index.js',
    minify: true,
    platform: 'browser',
    plugins: [sassPlugin()],
});

build({
    ...common,
    entryPoints: ['src/react/index.ts'],
    outfile: 'build/react/index.js',
    platform: 'neutral',
    external: ['react'],
    target: 'es6',
    format: 'cjs',
});

build({
    ...common,
    entryPoints: ['src/plugin/index.ts'],
    outfile: 'build/plugin/index.js',
    platform: 'node',
    packages: 'external',
    define: {
        PACKAGE: JSON.stringify(pkg.name),
    },
});

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
});
