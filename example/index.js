import transform from '@diplodoc/transform';
import htmlPlugin from '@diplodoc/html-extension';
import {readFile, writeFile} from 'node:fs/promises';
import {exec} from 'node:child_process';
import {promisify} from 'node:util';

(async () => {
    const content = await readFile('./README.md', 'utf8');
    const {result} = await transform(content, {
        needToSanitizeHtml: false,
        output: './build',
        plugins: [
            htmlPlugin.transform({
                bundle: true,
                head: `
                    <base target="_parent" />
                    <meta http-equiv="Content-Security-Policy" content="script-src 'none'" />
                    <style>
                        h2 {
                            color: gray;
                        }
                    </style>
                `,
                embeddingMode: 'srcdoc',
                isolatedSandboxHost: 'http://localhost:5005/runtime.html',
            }),
        ],
    });

    const html = `
<html>
    <head>
        ${result.meta.script.map((scriptFile) => `<script src="${scriptFile}"></script>`).join('\n')}
        ${result.meta.style.map((styleFile) => `<link rel="stylesheet" href="${styleFile}" />`).join('\n')}
    </head>
    <body>
        ${result.html}
    </body>
</html>
    `;

    await writeFile('./build/index.html', html);
    await promisify(exec)('open build/index.html');
})();
