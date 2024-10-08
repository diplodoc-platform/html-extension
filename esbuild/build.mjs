#!/usr/bin/env node

import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {build} from 'esbuild';
import {sassPlugin} from 'esbuild-sass-plugin';
import {htmlPlugin} from '@craftamap/esbuild-plugin-html';

const tsconfigJson = readJSON('../tsconfig.json');
const packageJson = readJSON('../package.json');

const {
    compilerOptions: {target},
} = tsconfigJson;

const common = {
    bundle: true,
    sourcemap: true,
    target,
    tsconfig: './tsconfig.json',
};

build({
    ...common,
    entryPoints: ['src/utils/index.ts'],
    outfile: 'build/utils/index.js',
    minify: true,
    platform: 'browser',
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
        PACKAGE: JSON.stringify(packageJson.name),
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

function readJSON(path) {
    const currentFilename = fileURLToPath(import.meta.url);
    return JSON.parse(readFileSync(`${dirname(currentFilename)}/${path}`));
}
