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
        iframe.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
    }
};

export const isHTMLElement = (node: Node): node is HTMLElement =>
    node.nodeType === Node.ELEMENT_NODE;
export const isIFrame = (
    element?: HTMLElement | EventTarget | null,
): element is HTMLIFrameElement =>
    element !== undefined &&
    element instanceof Element &&
    element.tagName.toLowerCase() === 'iframe';

export const setIframeStyles = (block: HTMLIFrameElement, styles: Record<string, string>) => {
    Object.keys(styles).forEach((property) => {
        block.contentWindow?.document.body.style.setProperty(property, styles[property]);
    });
};
