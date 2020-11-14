import {keydownHandler} from "/prosemirror/dist/prosemirror-keymap.es.js"
import {TextSelection, NodeSelection, Plugin} from "/prosemirror/dist/prosemirror-state.es.js"
import {Decoration, DecorationSet} from "/prosemirror/dist/prosemirror-view.es.js"

import {GapSelection} from "./GapSelection.js"
import {isLeafBlock} from "./selectionUtils.js"

// :: () → Plugin
// Create a gap cursor plugin. When enabled, this will capture clicks
// near and arrow-key-motion past places that don't have a normally
// selectable position nearby, and create a gap cursor selection for
// them. The cursor is drawn as an element with class
// `ProseMirror-gapcursor`. You can either include
// `style/gapcursor.css` from the package's directory or add your own
// styles to make it visible.
export const apogeeSelectionPlugin = function() {
    return new Plugin({
        props: {
            decorations: drawGapCursor,

            createSelectionBetween(_view, $anchor, $head) {
                if((GapSelection.isGapLocation($anchor))||(GapSelection.isGapLocation($head))) return new GapSelection($anchor, $head)
            },

            handleClick,
            handleKeyDown
        }
    })
}

export {GapSelection}

const handleKeyDown = keydownHandler({
    "ArrowLeft": arrow("horiz", -1, false),
    "ArrowRight": arrow("horiz", 1, false),
    "ArrowUp": arrow("vert", -1, false),
    "ArrowDown": arrow("vert", 1, false),
    "Shift-ArrowLeft": arrow("horiz", -1, true),
    "Shift-ArrowRight": arrow("horiz", 1, true),
    "Shift-ArrowUp": arrow("vert", -1, true),
    "Shift-ArrowDown": arrow("vert", 1, true)
})

//code

////////////////////////////////////////////////////////////
// DOH! in code below, I use thehead for the moving part of the selection
// if there is a non-empty selection and a non-shift arrow, the
// end that moves depends on the arrow direction


function arrow(axis, dir, shiftPressed) {
    return function(state, dispatch, view) {
        let selection = state.selection
        let {$head, $anchor} = selection;

        if(selection instanceof NodeSelection) {
            //case 1: node selection
            if(isLeafBlock(selection.node)) {
                return _createGapSelectionNearNode($anchor,$head,axis,dir,shiftPressed,state,dispatch);
            }
            else {
                //just give up if we are not in a leaf block
                return false;
            }
        }
        else {
            //other cases need the moving side of the selection
            //get the moving side of the selection
            let $movingPos, $otherPos;
            if(shiftPressed) {
                //when shift, head always moves 
                $movingPos = $head;
                $otherPos = $anchor;
            }
            else {
                //without shift, the end in direction of motion moves
                $movingPos = (dir > 0) ? $head.max($anchor) : $head.min($anchor);
                $otherPos = ($movingPos === $head) ? $anchor : $head;
            }

            if(GapSelection.isGapLocation($movingPos)) {
                //create new selection leaving a gap position
                return _createSelectionMovingFromGap($movingPos,$otherPos,axis,dir,shiftPressed,state,dispatch)
            }
            else if ($movingPos.parent.isTextblock) {
                //create new selection leavnig a text position
                return _createSelectionMovingFromText($movingPos,$otherPos,axis,dir,shiftPressed,state,dispatch,view)
            }
        }
        //nto handled
        return false;
    }
}

/** This handle mouse clicks to make selections. Text and Node selections use default handling.
 * Here we make Gap Selections if needed. A Gap Selection is used if the cursor is at a gap location
 * or at least one end of a non-empty selection is at a gap location
 */
function handleClick(view, pos, event) {
    if (!view.editable) return false
    let $pos = view.state.doc.resolve(pos);

    //to be a gap selection one side must be a gap location
    let headWillBeGap = GapSelection.isGapLocation($pos);
    let tailWillBeGap;
    if(event.shiftKey) {
        tailWillBeGap = (view.state.selection instanceof GapSelection)&&(view.state.selection.this.anchorIsGap);  
    }
    else {
        tailWillBeGap = headWillBeGap;
    }
    if(! ((headWillBeGap)||(tailWillBeGap)) ) return false;
    
    //create the gap position 
    let $newHead = $pos;
    let $newAnchor;
    if(event.shiftKey) {
        $newAnchor = view.state.selection.$anchor;
    }
    else {
        $newAnchor = $newHead;
    }
    view.dispatch(view.state.tr.setSelection(new GapSelection($newAnchor,$newHead)))
    return true
}

function drawGapCursor(state) {
    if (!(state.selection instanceof GapSelection)) return null
    let widgets = [];
    if(state.selection.headIsGap) widgets.push(_createWidget(state.selection.head))
    if(state.selection.anchorIsGap) widgets.push(_createWidget(state.selection.anchor))
    return DecorationSet.create(state.doc,widgets)
}

function _createWidget(pos) {
    let node = document.createElement("div")
    node.className = "ProseMirror-gapcursor"
    return Decoration.widget(pos, node, {key: "gapselectioncursor"})
}

//=================================
// Internal Functions
//=================================

/** This method creates a GapSelection around the node, with the head in
 * the direction of travel (+1 or -1). 
 * Returns true if the operation either succeeds or would succeed (if dispatch 
 * were present) */
function _createGapSelectionNearNode($anchor,$head,axis,dir,shiftPressed,state,dispatch) {
    //execute if dispatch present
    if (dispatch) {
        let $newHead, $newAnchor;
        //get the new head - in the direction of travel from anchor
        //we won't assume the order of the current head and anchor
        if( ($head.pos > $anchor.pos) === (dir > 0) ) {
            $newHead = $head;
            $newAnchor = shiftPressed ? $anchor : $head
        }
        else {
            $newHead = $anchor;
            $newAnchor = shiftPressed ? $head : $anchor
        }
        dispatch(state.tr.setSelection(new GapSelection($newAnchor,$newHead)).scrollIntoView())
    }
    return true;
}

/** This sets a new selection updating the previous selection for motion in the given direction
 * from the moving side of the selection.
 * This handles a vertical and horizontal arrow the same, currently not caching position information into
 * the next line for the case of vertical arrow. */
function _createSelectionMovingFromGap($movingPos,$otherPos,axis,dir,shiftPressed,state,dispatch) {
    //the head is in a gap. navigate in the direction of travel until we reacn an inline node
    let doc = $movingPos.parent;
    let pos;
    let $newHead, $newAnchor;
    let headType, anchorType;

    if(dir > 0) dir = 1;
    else if(dir < 0) dir = -1

    //////////////////////////////////////////////////////////////
    //do the following code differently?
    //- get $head.nodeBefore or $head.nodeAfter
    //- check the type
    //-- list (or other container) - cycle through its children from start/end to find fist text block
    //-- text block - get position at start/end fro type text position
    //-- leaf block - get position before/after for type gap position
    ////////////////////
    // new alg
    // - start at current position
    // - go one unit in specified direction
    // - get parent node type:
    // -- none - check position type
    // --- this is a gap position - create gap selection here
    // --- this is not a gap - put cursor inside next text node
    // -- text - create a text selection here
    //////////////////////////////////////////////////////////////
    
    //from the current gap, find the next gap or inline node, whichever comes first
    for(pos = $movingPos.pos + dir; !headType; pos += dir) {
        if((pos > doc.content.size)||(pos < 0)) {
            //we reached the end of the doc
            //no new selection, but return this as handled
            return true;
        }
        let $pos = doc.resolve(pos);
        let parentNode = $pos.parent;
        if(parentNode == doc) {
            if(GapSelection.isGapLocation($pos)) {
                //we are at a gap location
                //put gap selection here
                $newHead = $pos;
                headType = "gap"
            }
            //we are between non-leaf node - continue moving
        }
        else if(parentNode.isTextblock) {
            //we are in a text node
            //this is the next position for text
            $newHead = doc.resolve(pos);
            headType = "text"
        }
        //if we get here - continue moving
        //maybe in a parent non-text node or maybe fall through from parent node null
    }

    //get the new anchor
    if(shiftPressed) {
        $newAnchor = $otherPos;
        anchorType = $newAnchor.depth ? "text" : "gap" //I am assuming it is 0 or in text. I maybe should be more careful
    }
    else {
        $newAnchor = $newHead;
        anchorType = headType
    }

    if((headType == "gap")||(anchorType == "gap")) {
        //gap selection
        if (dispatch) dispatch(state.tr.setSelection(new GapSelection($newAnchor,$newHead)).scrollIntoView())
        return true
    }
    else {
        //text selection
        if (dispatch) dispatch(state.tr.setSelection(new TextSelection($newAnchor,$newHead)).scrollIntoView())
        return true
    }
}

/** This sets a new selection updating the previous selection for motion in the given direction
 * from the moving side of the selection (or takes no action, letting the default selection happen) */
function _createSelectionMovingFromText($movingPos,$otherPos,axis,dir,shiftPressed,state,dispatch,view) {
    //if we are in a text block and the next node is a leaf block, see if we leave the current text block
    //---------------------------------------------------------------------------------------------------------------
    // SCHEMA ASSUMPTION - We are assuming leaf nodes are always in the root level of the document, not in containers
    // further, we are not allowed to have an empty container block.
    //---------------------------------------------------------------------------------------------------------------

    //if we do not leave the current block, we will allow default selection handling.
    //but this is potentially expensive, at least for vertical, so we will do that check last

    //if our current text block is _not_ in the root level, our next block may be the next block in this grandparent
    //with our assumption, this would be a text block or a container of 1 or more text blocks.
    let grandparentDepth = $movingPos.depth-1
    if(grandparentDepth !== 0) {
        if($movingPos.index(grandparentDepth) !== ((dir > 0) ? $movingPos.node(grandparentDepth).childCount-1 : 0)) {
            //we are not the end block in the direction of motion
            //next block is a text block
            //use the default select handling
            return false
        } 
    }

    //check if the next block at document level is a leaf block (since we assume they are only at root level)
    let doc = $movingPos.doc;
    let nextBlockInRoot = doc.maybeChild($movingPos.index(0) + ((dir > 0) ? 1 : -1) );
    if((nextBlockInRoot)&&(isLeafBlock(nextBlockInRoot))) {
        //next block in direction of travel is a leaf block. We will make a gap selection if we leave the current block
        //we will do that check now (as mentioned above)

        //check if we leave the current block
        if( !( (axis == "vert") ? _leavesTextblockVertical(view, $movingPos, dir) : _leavesTextblockHorizontal(view, $movingPos, dir)) ) {
            //we do not leave the current block
            //use default selection handling
            return false;
        }

        //get the position ouside the current block and document level
        let newHeadPos = (dir > 0) ? $movingPos.end(1) + 1 : $movingPos.start(1) - 1;
        let $newHead = doc.resolve(newHeadPos);
        let $newAnchor = shiftPressed ? $otherPos : $newHead;
        if (dispatch) dispatch(state.tr.setSelection(new GapSelection($newAnchor,$newHead)).scrollIntoView())
        return true
    }
    else {
        //next is text or we leav document
        //use default selection handling
        return false;
    }
}

////////////////////////////////////////////////////////////////

//=========================
// Deep internal functions copied from ProseMirror domCoords.js and dom.js.
// I needed a few modifications.
//=========================

/** This is a copied version of endOfTextblockHorizontal from domCoords. I needed a modified version
 * of its partner function. When I copied this, the copy is only valid for the case
 * of non-bidirectional text. I am not supporting it, yet. */
function _leavesTextblockHorizontal(view, $pos, dir) {
    let offset = $pos.parentOffset, atStart = !offset, atEnd = offset == $pos.parent.content.size
    return (dir < 0) ? atStart : atEnd
}


/** This is a copied version of endOfTextblockVertical from domCoords, because I wanted it to be slightly 
 * different - the original only gives the right result for no shift key. */
function _leavesTextblockVertical(view, $pos, dir) {
    let {node: dom} = view.docView.domFromPos($pos.pos)
    for (;;) {
        let nearest = view.docView.nearestDesc(dom, true)
        if (!nearest) break
        if (nearest.node.isBlock) { dom = nearest.dom; break }
        dom = nearest.dom.parentNode
    }
    let coords = view.coordsAtPos($pos.pos)
    for (let child = dom.firstChild; child; child = child.nextSibling) {
        let boxes
        if (child.nodeType == 1) boxes = child.getClientRects()
        else if (child.nodeType == 3) boxes = __copied_textRange(child, 0, child.nodeValue.length).getClientRects()
        else continue
        for (let i = 0; i < boxes.length; i++) {
            let box = boxes[i]
            if (box.bottom > box.top && ((dir < 0) ? box.bottom < coords.top + 1 : box.top > coords.bottom - 1))
                return false
        }
    }
    return true

}

/** was dom.js textRange */
function __copied_textRange(node, from, to) {
    let range = document.createRange()
    range.setEnd(node, to == null ? node.nodeValue.length : to)
    range.setStart(node, from || 0)
    return range
}
