import transform from '@diplodoc/transform';
import htmlPlugin from '@diplodoc/html-extension';

import {readFile} from 'node:fs/promises';

(async () => {
    const content = await readFile('./README.md', 'utf8');
    const {result} = await transform(content, {
        output: './build',
        plugins: [
            htmlPlugin.transform({
                bundle: true,
            }),
        ],
    });

    const html = `
<html>
    <head>
        ${result.meta.script.map((scriptFile) => `<script src="${scriptFile}"></script>`)}
        ${result.meta.style.map((styleFile) => `<link rel="stylesheet" href="${styleFile}" />`)}
    </head>
    <body>
        ${result.html}
    </body>
</html>
    `;

    // eslint-disable-next-line no-console
    console.log(html);
})();
