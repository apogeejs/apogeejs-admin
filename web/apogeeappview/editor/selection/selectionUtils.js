

export function isLeafBlock(node) {
    if(!node) return false;
    return node.isBlock && (node.isAtom || node.isLeaf);
}

export function isInline(node) {
    if(!node) return false;
    return node.isInline;
}

