import type {DynRequire} from './require-shim';

/* v8 ignore next */
import {createRequire} from 'node:module';

/* v8 ignore next */
export const dynrequire: DynRequire = createRequire(import.meta.url) as DynRequire;
