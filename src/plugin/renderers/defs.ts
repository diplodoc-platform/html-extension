export type RenderRuleFactoryOptions = {
    embedContentTransformFn?: (raw: string) => string;
    containerClassNames?: string;
    sandbox?: boolean | string;
};
