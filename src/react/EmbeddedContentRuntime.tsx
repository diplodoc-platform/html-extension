import {FC} from 'react';
import {useDiplodocEmbeddedContent} from './useDiplodocHtml';

export const EmbeddedContentRuntime: FC = () => {
    useDiplodocEmbeddedContent();

    return null;
};
