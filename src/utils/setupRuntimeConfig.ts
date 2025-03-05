import { HTML_RUNTIME_CONFIG_SYMBOL } from "../constants";
import { HTMLRuntimeConfig } from "../types";

export const setupRuntimeConfig = (runtimeConfig: HTMLRuntimeConfig) => {
    window[HTML_RUNTIME_CONFIG_SYMBOL] = runtimeConfig;
}