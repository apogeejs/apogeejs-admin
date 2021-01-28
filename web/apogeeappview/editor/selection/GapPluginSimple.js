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
export const gapSelectionPlugin = function() {
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
  "ArrowLeft": arrow("horiz", -1),
  "ArrowRight": arrow("horiz", 1),
  "ArrowUp": arrow("vert", -1),
  "ArrowDown": arrow("vert", 1)
})

function arrow(axis, dir) {
  let dirStr = axis == "vert" ? (dir > 0 ? "down" : "up") : (dir > 0 ? "right" : "left")
  return function(state, dispatch, view) {
    let sel = state.selection
    let $start = dir > 0 ? sel.$to : sel.$from, mustMove = sel.empty
    if (sel instanceof TextSelection) {
      if (!view.endOfTextblock(dirStr) || $start.depth == 0) return false
      mustMove = false
      $start = state.doc.resolve(dir > 0 ? $start.after() : $start.before())
    }
    let $found = GapSelection.findFrom($start, dir, mustMove)
    if (!$found) return false
    if (dispatch) dispatch(state.tr.setSelection(new GapSelection($found)))
    return true
  }
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
  let node = document.createElement("div")
  node.className = "ProseMirror-gapcursor"
  let widgets = [];
  if(state.selection.anchorIsGap) widgets.push(Decoration.widget(state.selection.anchor, node, {key: "gapselectioncursor"}))
  if(state.selection.headIsGap) widgets.push(Decoration.widget(state.selection.head, node, {key: "gapselectioncursor"}))
  return DecorationSet.create(state.doc,widgets)
}
