export type IEmbeddedContentController = {
    setRootClassNames: (classNames: string[] | undefined) => Promise<void>;
    setRootStyles: (styles: Record<string, string> | undefined) => Promise<void>;
};
