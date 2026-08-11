import type {DynRequire} from './require-shim';

// eslint-disable-next-line @typescript-eslint/no-require-imports
/* v8 ignore next */
export const dynrequire: DynRequire = require as DynRequire;
