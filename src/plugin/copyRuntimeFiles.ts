import {dynrequire} from './utils';

const PATH_TO_RUNTIME = '../runtime';

interface CopyRuntimeFilesPaths {
    runtimeJsPath: string;
    output: string;
}

export function copyRuntimeFiles(
    {runtimeJsPath, output}: CopyRuntimeFilesPaths,
    cache: Set<string>,
) {
    const {join, resolve} = dynrequire('node:path');
    const runtimeFiles = {
        'index.js': runtimeJsPath,
    };
    for (const [originFile, outputFile] of Object.entries(runtimeFiles)) {
        const file = join(PATH_TO_RUNTIME, originFile);
        if (!cache.has(file)) {
            cache.add(file);
            copyFile(resolve(__dirname, file), join(output, outputFile));
        }
    }
}

function copyFile(from: string, to: string) {
    const {mkdirSync, copyFileSync} = dynrequire('node:fs');
    const {dirname} = dynrequire('node:path');
    mkdirSync(dirname(to), {recursive: true});
    copyFileSync(from, to);
}
