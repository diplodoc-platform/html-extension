import {IDisposable} from './Disposable';

export interface IEmbeddedContentController extends IDisposable {
    initialize: () => Promise<void>;
    setRootClassNames: (classNames: string[] | undefined) => Promise<void>;
    setRootStyles: (styles: Record<string, string> | undefined) => Promise<void>;
}
