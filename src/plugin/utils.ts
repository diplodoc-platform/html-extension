import sanitizeHtml from 'sanitize-html';

export const defaultSanitize = (dirtyHtml: string) => sanitizeHtml(dirtyHtml);

export function addHiddenProperty<
    B extends Record<string | symbol, unknown>,
    F extends string | symbol,
    V,
>(box: B, field: F, value: V) {
    if (!(field in box)) {
        Object.defineProperty(box, field, {
            enumerable: false,
            value: value,
        });
    }

    return box as B & {[P in F]: V};
}

export const resizeIframeToFitContent = (iframe: HTMLIFrameElement): void => {
    if (iframe.contentWindow) {
        iframe.height = iframe.contentWindow.document.documentElement.scrollHeight + "px";
    }
};
