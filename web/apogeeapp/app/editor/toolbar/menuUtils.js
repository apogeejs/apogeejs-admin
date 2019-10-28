//===============================
// Utility Functions for toolbr mark and node commands
//===============================

export function setTextBlock(state, type, dispatch) {
    let {$from, $to} = state.selection;

    let range = $from.blockRange($to);

    console.log("out");
    //remove any list tags (ol, ul)
    //convert all blocks to this block type (if not already this type)

    //setBlockType(nodeType, attrs)
    //wrapIn(nodeType, attrs)
    //lift(state, dispatch)

    //wrap in a workerParent block
    //go through text blocks
    //if it is a list item, i
}

export function setListBlock(state, type, dispatch) {
    //convert all blocks to list items (if not already this type)
    //wrap the range of selections in a list of this type
    //set any child lists to this type (if they are not already)
}

export function listIndent(state, dispatch) {
    alert("List indent not implmented!");
}

export function listUnindent(state, dispatch) {
    alert("List unindent not implmented!");
}

export function setMark(markType, attrs, state, dispatch) {
    let { empty, $cursor, ranges } = state.selection
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
    if (dispatch) {
        if ($cursor) {
            dispatch(state.tr.addStoredMark(markType.create(attrs)))
        }
        else {
            let tr = state.tr
            for (let i = 0; i < ranges.length; i++) {
                let { $from, $to } = ranges[i]
                tr.addMark($from.pos, $to.pos, markType.create(attrs))
            }
            dispatch(tr.scrollIntoView())
        }
    }
    return true
}


export function clearMark(markType, state, dispatch) {
    let { empty, $cursor, ranges } = state.selection
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
    if (dispatch) {
        if ($cursor) {
            dispatch(state.tr.removeStoredMark(markType))
        }
        else {
            let tr = state.tr
            for (let i = 0; i < ranges.length; i++) {
                let { $from, $to } = ranges[i]
                tr.removeMark($from.pos, $to.pos, markType)
            }
            dispatch(tr.scrollIntoView())
        }
    }
    return true
}

function markApplies(doc, ranges, type) {
    for (let i = 0; i < ranges.length; i++) {
        let { $from, $to } = ranges[i]
        let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false
        doc.nodesBetween($from.pos, $to.pos, node => {
            if (can) return false
            can = node.inlineContent && node.type.allowsMarkType(type)
        })
        if (can) return true
    }
    return false
}
