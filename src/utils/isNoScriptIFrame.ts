export function isNoScriptIFrame(frame: HTMLElement) {
    if (!(frame instanceof HTMLIFrameElement)) {
        return false;
    }

    for (const token of frame.sandbox) {
        if (token === 'allow-scripts') {
            return false;
        }
    }

    return true;
}
