# Diplodoc html extension

#### TODO: add html-extension.svg
[![NPM version](https://img.shields.io/npm/v/@diplodoc/html-extension.svg?style=flat)](https://www.npmjs.org/package/@diplodoc/html-extension)

This is an extension of the Diplodoc platform, which allows adding HTML in the documentation.

The extension contains some parts:
- [Prepared runtime](#prepared-runtime)
- [MarkdownIt transform plugin](#markdownit-transform-plugin)
- [HTML plugin API](#api)
- [React hook for smart control](#react-hook-for-smart-control)

## Quickstart

Attach the plugin to the transformer:

```js
import htmlExtension from '@diplodoc/html-extension';
import transform from '@diplodoc/transform';
import * as sanitizeHtml from 'sanitize-html';

const {result} = await transform(`
::: html

<article class="forecast">
  <h1>Weather forecast for Seattle</h1>
  <article class="day-forecast">
    <h2>12 June 2024</h2>
    <p>Rain.</p>
  </article>
  <article class="day-forecast">
    <h2>13 June 2024</h2>
    <p>Periods of rain.</p>
  </article>
  <article class="day-forecast">
    <h2>14 June 2024</h2>
    <p>Heavy rain.</p>
  </article>
</article>

:::
`, {
    plugins: [
        htmlExtension.transform({
            sanitize: dirtyHtml => sanitizeHtml(dirty, {
                allowedTags: ['article', 'h1', 'h2', 'p', 'span'],
                allowedAttributes: {
                    '*': ['class']
                }
            }),
            cssValiables: {
                '--html-color-primary': '#000'
            },
            shouldUseIframe: true,
            className: 'yfm-html'
        })
    ]
});
```

## Prepared runtime

It is necessary to add `runtime` scripts to make html interactive on your page.<br/>
You can add assets files which were generated by the [MarkdownIt transform plugin](#markdownit-transform-plugin).
```html
<html>
    <head>
        <!-- Read more about '_assets/html-extension.js' and '_assets/html-extension.css' in 'Transform plugin' section -->
        <script src='_assets/html-extension.js' async></script>
        <link rel='stylesheet' href='_assets/html-extension.css' />
    </head>
    <body>
        ${result.html}
    </body>
</html>
```

Or you can just include runtime's source code in your bundle.
```js
import '@diplodoc/html-extension/runtime'
import '@diplodoc/html-extension/runtime/styles.css'
```

## MarkdownIt transform plugin

Plugin for [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package.

Options:
- `runtimeJsPath` - name on runtime script which will be exposed in results `script` section.<br>
  Default: `_assets/html-extension.js`<br>

- `runtimeCssPath` - name on runtime css file which will be exposed in results `style` section.<br>
  (Default: `_assets/html-extension.css`)<br>

- `bundle` - boolean flag to enable/disable copying of bundled runtime to target directory.<br>
  Where target directore is `<transformer output option>/<plugin runtime option>`<br>
  Default: `true`<br>

- `containerClasses` - additional classes which will be added to tab's container node. It allows to customize the html view.<br>
  Example: `my-own-class and-other-class`<br>
  Default: `undefined`<br>

## API

### Syntax

This plugin uses the directive syntax [proposed](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) in the CommonMark community, indicated by a block-level double colon at the beginning and end of a block. This HTML directives use `::: html` to open an HTML block, followed by your HTML content, and then `:::` to close the block. The number of empty lines before or after the opening or closing block is not significant.

Please note:
- Nested content within the block will not be parsed as Markdown.
- Embedded directives within the block are not supported.
- Inline directives are not yet supported.


Simple example:
```
::: html

<div>Your HTML code is here</div>

:::
```
Example with some styles:
```
::: html
<style>
<style>
  :root {
    --dark-bg-color: #000;
    --dark-text-color: #FFF;
  }
  .dark {
    background-color: var(--primary-bg-color);
    color: : var(--primary-text-color);
  }
</style>
<div class="dark">Some info is here</div>
:::
```

## React hook for smart control

You can use the React hook to interact programmatically with the HTML content inside the block.

```TypeScript
import React, { useEffect } from 'react'
import {useDiplodocHtml, HTMLBlock} from '@diplodoc/html-extension/react';

export const App: React.FC = () => {
    const selectTabHandler = useCallback<UseDiplodocTabsCallback>(
        (html: HTMLBlock, currentTabId?: string) => {
            const {group, key} = tab;
            // Group could be empty
            if (group) {
                // ...
            }
        },
        [],
    );

    const {selectTab, selectTabById} = useDiplodocTabs(selectTabHandler);

    useEffect(() => {
        selectTab({ group: 'group_1', key: 'my-key' });
        // selectTabById('my-key-2');
    }, [selectTab, selectTabById]);

}
```
