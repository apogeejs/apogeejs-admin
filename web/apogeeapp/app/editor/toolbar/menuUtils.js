//===============================
// Utility Functions for toolbr mark and node commands
//===============================

export function markApplies(doc, ranges, type) {
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


