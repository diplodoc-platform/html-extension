import type transformYFM from '@diplodoc/transform';
import type {PluginOptions, transform as nativeTransform} from './transform';

type InstalledTransformOptions = NonNullable<Parameters<typeof transformYFM>[1]>;
type InstalledTransformPlugin = NonNullable<InstalledTransformOptions['plugins']>[number];
type TransformHostPlugin = ReturnType<typeof nativeTransform> & InstalledTransformPlugin;

/** Creates a native markdown-it 13 plugin with the installed Transform host contract. */
export declare function transform(options?: Partial<PluginOptions>): TransformHostPlugin;
