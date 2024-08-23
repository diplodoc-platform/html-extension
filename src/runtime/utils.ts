export const isHTMLElement = (node: Node): node is HTMLElement =>
    node.nodeType === Node.ELEMENT_NODE;
