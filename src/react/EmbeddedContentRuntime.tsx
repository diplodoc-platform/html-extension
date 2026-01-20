import type {FC} from 'react';

import {useMemo} from 'react';

import {useDiplodocEmbeddedContent} from './useDiplodocHtml';

type EmbeddedContentRuntimeProps = {
    isolatedSandboxHostURIOverride?: string;
};

export const EmbeddedContentRuntime: FC<EmbeddedContentRuntimeProps> = ({
    isolatedSandboxHostURIOverride,
}) => {
    const config = useMemo(
        () => ({isolatedSandboxHostURIOverride}),
        [isolatedSandboxHostURIOverride],
    );

    useDiplodocEmbeddedContent(config);

    return null;
};
