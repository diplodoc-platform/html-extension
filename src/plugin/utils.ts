import {StylesObject} from '../types';

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

/*
 * Runtime require hidden for builders.
 * Used for nodejs api
 */
export function dynrequire(module: string) {
    // eslint-disable-next-line no-eval
    return eval(`require('${module}')`);
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
const hasOwnProperty = (obj: Object, prop: string) =>
    Object.prototype.hasOwnProperty.call(obj, prop);

export const getStyles = (styles: StylesObject): string => {
    let result = '';

    for (const selector in styles) {
        if (hasOwnProperty(styles, selector)) {
            const properties = styles[selector];
            let propertiesString = '';

            for (const property in properties) {
                if (hasOwnProperty(properties, property)) {
                    const value = properties[property];
                    propertiesString += `${property}: ${value};`;
                }
            }
            result += `${selector} { ${propertiesString} }`;
        }
    }

    return result;
};
