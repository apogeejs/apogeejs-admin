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
  return function(state, dispatch, view) {
    let selection = state.selection
    console.log(axis + " " + dir + " " + shiftPressed);
    if(selection instanceof NodeSelection) {
      if(_isLeafBlock(selection.node)) {
        let $newHead, $newAnchor;
        //get the new head - in the direction of travel from anchor
        //we won't assume the order of the current head and anchor
        if( (selection.$head.pos > selection.$anchor.pos) === (dir === 1) ) {
          $newHead = selection.$head;
          $newAnchor = shiftPressed ? selection.$anchor : selection.$head
        }
        else {
          $newHead = selection.$anchor;
          $newAnchor = shiftPressed ? selection.$head : selection.$anchor
        }
        if (dispatch) dispatch(state.tr.setSelection(new GapSelection($newAnchor,$newHead)))
        return true
      }
      else {
        //just give up if we are not in a leaf block
        return false;
      }
    }
    else if(selection.$head.depth === 0) {
      //the head is in a gap. navigate in the direction of travel until we reacn an inline node
      let doc = selection.$head.parent;
      let pos;
      let $newHead, $newAnchor;
      let headType, anchorType
      //get the new head
      for(pos = selection.$head.pos; !headType; pos += dir) {
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
      
      //get the new anchor
      if(shiftPressed) {
        $newAnchor = selection.$anchor;
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
    else if(selection instanceof TextSelection) {
      let x = 0;
      return false;
    }
    else {
      return false;
    }
  }

  // {
  //   let $start = dir > 0 ? sel.$to : sel.$from, mustMove = sel.empty
  //   if (sel instanceof TextSelection) {
  //     if (!view.endOfTextblock(dirStr) || $start.depth == 0) return false
  //     mustMove = false
  //     $start = state.doc.resolve(dir > 0 ? $start.after() : $start.before())
  //   }
  //   let $found = GapSelection.findFrom($start, dir, mustMove)
  //   if (!$found) return false
  //   if (dispatch) dispatch(state.tr.setSelection(new GapSelection($found)))
  //   return true
  // }
}

function handleClick(view, pos, event) {
  if (!view.editable) return false
  let $pos = view.state.doc.resolve(pos)
  if (!GapSelection.validEnd($pos)) return false
  let {inside} = view.posAtCoords({left: event.clientX, top: event.clientY})
  if (inside > -1 && NodeSelection.isSelectable(view.state.doc.nodeAt(inside))) return false
  view.dispatch(view.state.tr.setSelection(new GapSelection($pos)))
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
