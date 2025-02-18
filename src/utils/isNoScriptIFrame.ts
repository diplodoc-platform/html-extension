export function isNoScriptIFrame(frame: HTMLElement) {
    if (!(frame instanceof HTMLIFrameElement) || !frame.hasAttribute('sandbox')) {
        return false;
    }

    for (const token of frame.sandbox) {
        if (token === 'allow-scripts') {
            return false;
        }
    }

    return true;
}
