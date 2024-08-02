export const DEFAULT_PADDING = 34;
export const resizeIframeToFitContent = (
    body,
    padding = DEFAULT_PADDING,
): void => {
    if (iframe.contentWindow) {
        const frameDocument = iframe.contentDocument || iframe.contentWindow.document;
        iframe.style.height = frameDocument.body.scrollHeight + padding + 'px';
    }
};
