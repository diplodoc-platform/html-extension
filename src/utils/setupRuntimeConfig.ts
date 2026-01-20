import type {HTMLRuntimeConfig} from '../types';

import {HTML_RUNTIME_CONFIG_SYMBOL} from '../constants';

export const setupRuntimeConfig = (runtimeConfig: HTMLRuntimeConfig) => {
    window[HTML_RUNTIME_CONFIG_SYMBOL] = runtimeConfig;
};
