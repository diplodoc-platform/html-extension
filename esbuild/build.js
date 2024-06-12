#!/usr/bin/env node

const esbuild = require('esbuild');
const {
    compilerOptions: {target},
} = require('../tsconfig.json');

const common = {
    bundle: true,
    sourcemap: true,
    target: target,
    tsconfig: './tsconfig.json',
};

esbuild.build({
    ...common,
    entryPoints: ['src/index.ts'],
    outfile: 'index.js',
    minify: true,
});
