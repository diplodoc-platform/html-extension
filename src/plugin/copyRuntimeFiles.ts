const PATH_TO_RUNTIME = '../runtime';

export function copyRuntimeFiles(
    {
        runtimeJsPath,
        runtimeCssPath,
        output,
    }: {runtimeJsPath: string; runtimeCssPath: string; output: string},
    cache: Set<string>,
) {
    const {join, resolve} = dynrequire('node:path');
    const runtimeFiles = {
        'index.js': runtimeJsPath,
        'index.css': runtimeCssPath,
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

/*
 * Runtime require hidden for builders.
 * Used for nodejs api
 */
function dynrequire(module: string) {
    // eslint-disable-next-line no-eval
    return eval(`require('${module}')`);
}
