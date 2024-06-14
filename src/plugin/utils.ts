import sanitizeHtml from 'sanitize-html';

export const defaultSanitize = (dirtyHtml: string) => sanitizeHtml(dirtyHtml);
