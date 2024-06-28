export const resizeIframeToFitContent = (iframe: HTMLIFrameElement): void => {
    if (iframe.contentWindow) {
        iframe.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
    }
};

export const isHTMLElement = (node: Node): node is HTMLElement =>
    node.nodeType === Node.ELEMENT_NODE;

export const setIframeStyles = (block: HTMLIFrameElement, styles: Record<string, string>) => {
    Object.keys(styles).forEach((property) => {
        block.contentWindow?.document.body.style.setProperty(property, styles[property]);
    });
};

export interface QueueManager<T extends any> {
    start: () => void;
    push: (callback: QueueManagerCallback<T>) => void;
}

export type QueueManagerCallback<T> = (...args: T[]) => void;

export const createQueueWithWait = <T extends any>(...args: T[]) => {
    let lastExecuted: Promise<unknown> = Promise.resolve();
    let started = false;

    const manager: QueueManager<T> = {
        start: () => {
            started = true;
        },
        push: (callback) => {
            lastExecuted = lastExecuted.then(() => plan(callback));
        },
    };

    async function plan(callback: QueueManagerCallback<T>) {
        return new Promise((resolve) => {
            const execute = () => callback(...args);

            // resolve the promise only when execution is started
            if (started) {
                resolve(execute());
            } else {
                manager.start = () => {
                    started = true;
                    resolve(execute());
                };
            }
        });
    }

    return manager;
};

export const isIFrameLoaded = (iframe: HTMLIFrameElement): boolean => {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDocument) {
        const iframeBodyInnerHTML = iframeDocument.body ? iframeDocument.body.innerHTML : '';
        return iframeDocument.readyState === 'complete' && Boolean(iframeBodyInnerHTML);
    }
    return false;
};
