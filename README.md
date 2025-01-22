# @diplodoc-platform/html-extension

[![NPM version](https://img.shields.io/npm/v/@diplodoc/html-extension.svg?style=flat)](https://www.npmjs.org/package/@diplodoc/html-extension)

## Customizable HTML embedding solution for YFM-aware applications.

This is an extension of the Diplodoc platform, which allows embedding HTML via Markdown directives.

## Overview of this file

This file contains info on the following topics:

- [Embedding strategies](#embedding-strategies) supported by the extension
- [Recommendations on `isolated` strategy usage](#a-note-on-isolated-strategy-usage) to make sure you can embed potentially unsafe content in a safe way
- [Docs for browser runtime](#prepared-runtime), this extension's component which is responsible for properly displaying the embedded content in browser.
- [Docs for MarkdownIt transform plugin](#markdownit-transform-plugin), which was specifically tailored for use with `@diplodoc-platform/transform`. It ensures the embedding syntax can be rendered as HTML.
- [Docs for React hooks](#react-hook-for-smart-control)

## Syntax

This plugin uses the container block directive syntax. For more information see here: [diplodoc-platform/directive](https://github.com/diplodoc-platform/directive/?tab=readme-ov-file#directive-syntax).

Simple example:

```md
::: html

<div>Your HTML code is here</div>

:::
```

Example with some styles:

```md
::: html
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

## Quickstart

Attach the plugin to the transformer:

```js
import htmlExtension from '@diplodoc/html-extension';
import transform from '@diplodoc/transform';
import * as sanitizeHtml from 'sanitize-html';

const {result} = await transform(
  `
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
`,
  {
    plugins: [
      htmlExtension.transform({
        sanitize: (dirtyHtml) =>
          sanitizeHtml(dirtyHtml, {
            allowedTags: ['article', 'h1', 'h2', 'p', 'span'],
            allowedAttributes: {
              '*': ['class'],
            },
          }),
        containerClasses: 'my-own-class',
      }),
    ],
  },
);
```

## Embedding strategies

The extension supports three different embedding strategies:

- `srcdoc` — Uses an IFrame with `srcdoc` attribute to embed specified HTML. As such, the IFrame inherits parent's origin _and_ `Content-Security-Policy`. However, all CSS is isolated by default and there can never be any style leakage. Depending on the CSP used, this mode introduces a potential attack vector, since arbitrary JS code could have been allowed to be run by host's CSP. As such, use of sanitization is strongly preferred when using this mode (see below in [plugin documentation](#markdownit-transform-plugin)). You can use the `sandbox` option to set additional restrictions on the IFrame, including script execution.
- `shadow` — Currently an experimental strategy that uses a ShadowRoot to embed content into the host page. Very similar in application and effects to `srcdoc`, but uses less runtime logic in browser, providing a more smooth experience (eliminates height resize jitters, etc.). Content sanitization is still strongly recommended. Styles declared inside of the ShadowRoot are isolated from the rest of the page as per ShadowDOM rules, and potential _inheritable_ global styles are isolated via `all: initial` at Shadow DOM boundary.
- `isolated` — A strategy that uses a special IFrame that should be hosted on a separate origin such that Same-Origin-Policy (SOP) would not apply for this IFrame. By opting-out of SOP, any scripts that are being run inside of the IFrame cannot get access to parent's execution context, as well as its storage, cookies and more. Crucially, this mode also provides an option to use a less restrictive CSP for content inside trhe IFrame. As such, this strategy is ideal for widget embedding (or other types of potentially unsafe content).

  Please note that while one could enforce SOP failure by providing `srcdoc` IFrame with `sandbox` attribute, the only way to override parent's (host's) CSP to a less restrictive set of policies would be to physically host an IFrame on a different origin.

  Due to high level of isolation, sanitization is not required. Moreover, this mode/strategy was specifically designed to work with unsanitized/unrestricted content, and as such, `sanitize` option of this extension's MarkdownIt plugin explicitly has no effect when using this mode.

## A note on `isolated` strategy usage

While `srcdoc` and `shadow` modes require no further minimal setup other than including the runtime and using the plugin, `isolated` mode requires you to have a thin `isolated`-compatible IFrame runtime hosted somewhere on a separate origin.

The IFrame runtime which contains the code necessary to communicate with the host's runtime is exposed as the `@diplodoc-platform/html-extension/iframe` export. This file can then be hosted in a multitude of ways:

- Use a CDN, since most CDNs' origins are not designed to host full web apps, and as such, these origins shouldn't have vital cookies, storage or other critical data associated with them, minimizing and/or effectively nullifying the potential harm that could be done when some malicious code is being run in the embed.
- Set up a different reverse proxy/HTTP server/L7 upstream that responds to a different `host` header/`:authority` pseudo-header.

Make sure not to use any subdomains of the app, since this way cookies could still get exposed to malicious code.

## Browser runtime

It is necessary to add `runtime` scripts to make embeds interactive on your page.<br/>
You can add assets files which were generated by the [MarkdownIt transform plugin](#markdownit-transform-plugin).

```html
<html>
  <head>
    <!-- Read more about '_assets/html-extension.js' and '_assets/html-extension.css' in 'Transform plugin' section -->
    <script src="_assets/html-extension.js" async></script>
  </head>
  <body>
    ${result.html}
  </body>
</html>
```

Or you can just include runtime's source code in your bundle.

```js
import '@diplodoc/html-extension/runtime';
```

## MarkdownIt transform plugin

Plugin for [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package.

Options:

- `runtimeJsPath` - name on runtime script which will be exposed in results `script` section.<br>
  Default: `_assets/html-extension.js`<br>

- `bundle` - boolean flag to enable/disable copying of bundled runtime to target directory.<br>
  Where target directore is `<transformer output option>/<plugin runtime option>`<br>
  Default: `true`<br>

- `containerClasses` - additional classes which will be added to tab's container node. It allows to customize the html view.<br>
  Example: `my-own-class and-other-class`<br>
  Default: `undefined`<br>

- `embeddingMode` - embedding [strategy](#embedding-strategies) which should be used for _all_ encountered embeds.

  Accepted values: `srcdoc`, `shadow`, `isolated`.

  Default: `srcdoc`.

- `isolatedSandboxHost` - fully-qualified URL of the [IFrame runtime](#a-note-on-isolated-strategy-usage) used specifically by `isolated` mode. Has no effect when other modes are used. This can still be overriden by [`EmbedsConfig.isolatedSandboxHostURIOverride`](./src/types.ts#L8) via [`EmbeddedContentRootController.initialize`](./src/runtime/EmbeddedContentRootController.ts#L53) and [`EmbeddedContentRootController.setConfig`](./src/runtime/EmbeddedContentRootController.ts#L94).
- `sanitize` - optional function that will be used to sanitize content in `srcdoc` and `shadow` modes if supplied.

- `sandbox` - sandbox-mode, used by `srcdoc` embedding strategy (see iframe sandbox attribute). Disabled by default.

## React hook for smart control

You can use the React hook to interact programmatically with the HTML content inside the block.

```TypeScript
// TODO
```
