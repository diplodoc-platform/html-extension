import {DependencyList, RefObject, useEffect} from 'react';

// import {useThemeValue} from '@gravity-ui/uikit';

export function useYfmHtmlThemes(ref: RefObject<HTMLElement>, deps: DependencyList) {
    const theme = 'dark'; // FIXME: debug only

    useEffect(() => {
        if (!ref.current) return;

        const htmlBlocks = ref.current.querySelectorAll<HTMLIFrameElement>('iframe.yfm_html');

        const bodyStyles = window.getComputedStyle(document.body);
        const colorValue = bodyStyles.getPropertyValue('--g-color-text-primary');

        for (const elem of Array.from(htmlBlocks)) {
            if (elem.contentWindow) {
                const iframeDoc = elem.contentWindow.document;
                if (iframeDoc.readyState === 'complete') {
                    iframeDoc.body.style.setProperty('--html-text-color', colorValue);
                }
                elem.onload = () => {
                    const iframeDoc2 = elem.contentWindow?.document;
                    if (iframeDoc2) {
                        iframeDoc2.body.style.setProperty('--html-text-color', colorValue);
                    }
                };
            }
        }
    }, [ref, theme, ...deps]);
}
