export const getEventTarget = (event: Event) => {
    const path = event.composedPath();
    return Array.isArray(path) && path.length > 0 ? path[0] : event.target;
};

export const isCustom = (event: Event) => {
    const target = getEventTarget(event);
    return !target || !(target as HTMLElement).matches;
};

export const getClosestScrollableParent = (element: HTMLElement): HTMLElement | undefined => {
    if (Math.abs(element.scrollHeight - element.clientHeight) > 1) {
        return element;
    }

    return element.parentElement ? getClosestScrollableParent(element.parentElement) : undefined;
};

export interface ElementOffset {
    top: number;
    left: number;
    scrollTop: number;
    scrollLeft: number;
}

export const getOffsetByScrollableParent = (
    element: HTMLElement,
    scrollableParent: HTMLElement,
): ElementOffset => {
    const elementBounds = element.getBoundingClientRect();
    const scrollableParentBounds = scrollableParent.getBoundingClientRect();
    return {
        top: elementBounds.top - scrollableParentBounds.top,
        left: elementBounds.left - scrollableParentBounds.left,
        scrollTop: scrollableParent.scrollTop,
        scrollLeft: scrollableParent.scrollLeft,
    };
};
