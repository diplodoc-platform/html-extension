export const updateStyles = (
    element: HTMLElement,
    styles: Record<string, string>,
    previousStyles: Record<string, string>,
) => {
    // remove all styles that are in previousStyles but not in styles
    Object.keys(previousStyles).forEach((property) => {
        if (!Object.prototype.hasOwnProperty.call(styles, property)) {
            element.style.removeProperty(property);
        }
    });

    // add or update styles that are in styles
    Object.keys(styles).forEach((property) => {
        element.style.setProperty(property, styles[property]);
    });
};

export const updateClassNames = (
    element: HTMLElement,
    classNames: string[],
    previousClassNames: string[],
) => {
    // remove all classes that were in previousClassNames but are not in classNames
    previousClassNames.forEach((className) => {
        if (!classNames.includes(className)) {
            element.classList.remove(className);
        }
    });

    // add classes that are in classNames
    classNames.forEach((className) => {
        if (!element.classList.contains(className)) {
            element.classList.add(className);
        }
    });
};
