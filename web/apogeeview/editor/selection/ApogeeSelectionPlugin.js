import {keydownHandler} from "/prosemirror/dist/prosemirror-keymap.es.js"
import {TextSelection, NodeSelection, Plugin} from "/prosemirror/dist/prosemirror-state.es.js"
import {Decoration, DecorationSet} from "/prosemirror/dist/prosemirror-view.es.js"

import {GapSelection} from "./GapSelection.js"

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
        if((GapSelection.validEnd($anchor))||(GapSelection.validEnd($head))) return new GapSelection($anchor, $head)
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


function arrow(axis, dir, shiftPressed) {
  let dirStr = axis == "vert" ? (dir > 0 ? "down" : "up") : (dir > 0 ? "right" : "left")
  return function(state, dispatch, view) {
    let selection = state.selection
    let {$head, $anchor} = selection;

    console.log(axis + " " + dir + " " + shiftPressed);
    if(selection instanceof NodeSelection) {
      if(_isLeafBlock(selection.node)) {
        let $newHead, $newAnchor;
        //get the new head - in the direction of travel from anchor
        //we won't assume the order of the current head and anchor
        if( ($head.pos > $anchor.pos) === (dir === 1) ) {
          $newHead = $head;
          $newAnchor = shiftPressed ? $anchor : $head
        }
        else {
          $newHead = $anchor;
          $newAnchor = shiftPressed ? $head : $anchor
        }
        if (dispatch) dispatch(state.tr.setSelection(new GapSelection($newAnchor,$newHead)))
        return true
      }
      else {
        //just give up if we are not in a leaf block
        return false;
      }
    }
    else if($head.depth === 0) { //should do a better test!!!
      //the head is in a gap. navigate in the direction of travel until we reacn an inline node
      let doc = $head.parent;
      let pos;
      let $newHead, $newAnchor;
      let headType, anchorType

      //////////////////////////////////////////////////////////////
      //do the following code differently?
      //- get $head.nodeBefore or $head.nodeAfter
      //- check the type
      //-- list (or other container) - cycle through its children from start/end to find fist text block
      //-- text block - get position at start/end fro type text position
      //-- leaf block - get position before/after for type gap position
      //////////////////////////////////////////////////////////////
      //from the current gap, find the next gap or inline node, whichever comes first
      for(pos = $head.pos; !headType; pos += dir) {
        if((pos > doc.content.size)||(pos < 0)) {
          //we reached the end of the doc
          //no new selection, but return this as handled
          return true;
        }
        let node = _getNextNodeAt(doc,pos,dir);
        if(!node) {
          //this will happen if we back into a non-leaf
        }
        else if(_isLeafBlock(node)) {
          //the next gap follows this
          $newHead = doc.resolve(pos + dir);
          headType = "gap"
        }
        else if(_isInline(node)) {
          //this is the next position for text
          $newHead = doc.resolve(pos);
          headType = "text"
        }
      }
      /////////////////////////////////////////////////////////////////
      
      //get the new anchor
      if(shiftPressed) {
        $newAnchor = $anchor;
        anchorType = $newAnchor.depth ? "text" : "gap" //I am assuming it is 0 or in text. I maybe should be more careful
      }
      else {
        $newAnchor = $newHead;
        anchorType = headType
      }

      if((headType == "gap")||(anchorType == "gap")) {
        //gap selection
        if (dispatch) dispatch(state.tr.setSelection(new GapSelection($newAnchor,$newHead)))
        return true
      }
      else {
        //text selection
        if (dispatch) dispatch(state.tr.setSelection(new TextSelection($newAnchor,$newHead)))
        return true
      }
    }
    else if ($head.parent.isTextblock) {
      //if we are in a text block and the next node is a leaf block, see if we leave the current text block
      /////////////////////////////////////////////////////////////////////////
      //- get index of current block within parent: $head.index($head.depth-1), $head.node($head.depth-1).childCount (double check indices)
      //- get "next" block in the parent's parent. If we are at the end of grandparent, get the "next" grandparent, etc
      //- look for textBlock or leafBlock.  
      //
      //- If the next block is a leaf block, then we need to check if we exit the current text block.
      //--If we do, we make a gap selection before/after the leaf block.
      //--If we do not, then we can do a let do default handling of the selection. 

      //_leavesTextblockHorizontal
      //_leavesTextblockVertical
      let x = 0;
      return false;
    }
    //nto handled
    return false;
  }
}

function handleClick(view, pos, event) {
  if (!view.editable) return false
  let $pos = view.state.doc.resolve(pos)
  if (!GapSelection.validEnd($pos)) return false
  let {inside} = view.posAtCoords({left: event.clientX, top: event.clientY})
  if (inside > -1 && NodeSelection.isSelectable(view.state.doc.nodeAt(inside))) return false
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



function _getNextNodeAt(doc,pos,dir) {
  if(dir == 1) {
    return doc.nodeAt(pos)
  }
  else if(dir == -1) {
    return doc.nodeAt(pos-1)
  }
  else {
    throw new Error("Get next node should be called with 1 or -1");
  }
}

function _isLeafBlock(node) {
  if(!node) return false;
  return node.isBlock && (node.isAtom || node.isLeaf);
}

function _isInline(node) {
  if(!node) return false;
  return node.isInline;
}


////////////////////////////////////////////////////////////////

/** This is a copied version of endOfTextblockHorizontal from domCoords. I needed a modified version
 * of its partner function. When I copied this, the copy is only valid for the case
 * of non-bidirectional text. I am not supporting it, yet. */
function _leavesTextblockHorizontal(view, $pos, dir) {
  let offset = $pos.parentOffset, atStart = !offset, atEnd = offset == $pos.parent.content.size
  return dir == "left" || dir == "backward" ? atStart : atEnd
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
      if (box.bottom > box.top && (dir == "up" ? box.bottom < coords.top + 1 : box.top > coords.bottom - 1))
        return false
    }
  }
  return true

}


function __copied_textRange(node, from, to) {
  let range = document.createRange()
  range.setEnd(node, to == null ? node.nodeValue.length : to)
  range.setStart(node, from || 0)
  return range
}
