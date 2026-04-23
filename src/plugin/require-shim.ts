// Alias-only stub. The esbuild `shimPlugin` (see esbuild/build.mjs) rewrites
// imports of './require-shim' to './require-shim.{esm,cjs}.ts' at build time.
//
// ESM target -> require-shim.esm.ts (createRequire(import.meta.url))
// CJS target -> require-shim.cjs.ts (native require)
//
// Source-level execution of plugin code that calls dynrequire() is NOT
// supported: run the built bundle (build/{esm,cjs}/plugin/index.js) instead.
//
// `DynRequire` avoids leaking the ambient `NodeRequire` type into the
// published `.d.ts`, which would force consumers to have `@types/node`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DynRequire = <T = any>(spec: string) => T;

export const dynrequire: DynRequire = (() => {
    throw new Error('require-shim: alias was not applied during build');
}) as unknown as DynRequire;
