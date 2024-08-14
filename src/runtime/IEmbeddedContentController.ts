export type IEmbeddedContentController = {
    initialize: () => Promise<void>;
    setRootClassNames: (classNames: string[] | undefined) => Promise<void>;
    setRootStyles: (styles: Record<string, string> | undefined) => Promise<void>;
    destroy: () => void;
};
