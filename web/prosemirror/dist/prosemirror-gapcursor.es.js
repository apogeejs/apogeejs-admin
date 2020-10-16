import { keydownHandler } from '/prosemirror/dist/prosemirror-keymap.es.js';
import { Selection, NodeSelection, Plugin, TextSelection } from '/prosemirror/dist/prosemirror-state.es.js';
import { DecorationSet, Decoration } from '/prosemirror/dist/prosemirror-view.es.js';
import { Slice } from '/prosemirror/dist/prosemirror-model.es.js';

// ::- Gap cursor selections are represented using this class. Its
// `$anchor` and `$head` properties both point at the cursor position.
class GapCursor extends Selection {
  // : (ResolvedPos)
  constructor($pos) {
    super($pos, $pos);
  }

  map(doc, mapping) {
    let $pos = doc.resolve(mapping.map(this.head));
    return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos)
  }

  content() { return Slice.empty }

  eq(other) {
    return other instanceof GapCursor && other.head == this.head
  }

  toJSON() {
    return {type: "gapcursor", pos: this.head}
  }

  static fromJSON(doc, json) {
    if (typeof json.pos != "number") throw new RangeError("Invalid input for GapCursor.fromJSON")
    return new GapCursor(doc.resolve(json.pos))
  }

  getBookmark() { return new GapBookmark(this.anchor) }

  static valid($pos) {
    let parent = $pos.parent;
    if (parent.isTextblock || !closedBefore($pos) || !closedAfter($pos)) return false
    let override = parent.type.spec.allowGapCursor;
    if (override != null) return override
    let deflt = parent.contentMatchAt($pos.index()).defaultType;
    return deflt && deflt.isTextblock
  }

  static findFrom($pos, dir, mustMove) {
    search: for (;;) {
      if (!mustMove && GapCursor.valid($pos)) return $pos
      let pos = $pos.pos, next = null;
      // Scan up from this position
      for (let d = $pos.depth;; d--) {
        let parent = $pos.node(d);
        if (dir > 0 ? $pos.indexAfter(d) < parent.childCount : $pos.index(d) > 0) {
          next = parent.child(dir > 0 ? $pos.indexAfter(d) : $pos.index(d) - 1);
          break
        } else if (d == 0) {
          return null
        }
        pos += dir;
        let $cur = $pos.doc.resolve(pos);
        if (GapCursor.valid($cur)) return $cur
      }

      // And then down into the next node
      for (;;) {
        let inside = dir > 0 ? next.firstChild : next.lastChild;
        if (!inside) {
          if (next.isAtom && !next.isText && !NodeSelection.isSelectable(next)) {
            $pos = $pos.doc.resolve(pos + next.nodeSize * dir);
            mustMove = false;
            continue search
          }
          break
        }
        next = inside;
        pos += dir;
        let $cur = $pos.doc.resolve(pos);
        if (GapCursor.valid($cur)) return $cur
      }

      return null
    }
  }
}

GapCursor.prototype.visible = false;

Selection.jsonID("gapcursor", GapCursor);

class GapBookmark {
  constructor(pos) {
    this.pos = pos;
  }
  map(mapping) {
    return new GapBookmark(mapping.map(this.pos))
  }
  resolve(doc) {
    let $pos = doc.resolve(this.pos);
    return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos)
  }
}

function closedBefore($pos) {
  for (let d = $pos.depth; d >= 0; d--) {
    let index = $pos.index(d);
    // At the start of this parent, look at next one
    if (index == 0) continue
    // See if the node before (or its first ancestor) is closed
    for (let before = $pos.node(d).child(index - 1);; before = before.lastChild) {
      if ((before.childCount == 0 && !before.inlineContent) || before.isAtom || before.type.spec.isolating) return true
      if (before.inlineContent) return false
    }
  }
  // Hit start of document
  return true
}

function closedAfter($pos) {
  for (let d = $pos.depth; d >= 0; d--) {
    let index = $pos.indexAfter(d), parent = $pos.node(d);
    if (index == parent.childCount) continue
    for (let after = parent.child(index);; after = after.firstChild) {
      if ((after.childCount == 0 && !after.inlineContent) || after.isAtom || after.type.spec.isolating) return true
      if (after.inlineContent) return false
    }
  }
  return true
}

// :: () → Plugin
// Create a gap cursor plugin. When enabled, this will capture clicks
// near and arrow-key-motion past places that don't have a normally
// selectable position nearby, and create a gap cursor selection for
// them. The cursor is drawn as an element with class
// `ProseMirror-gapcursor`. You can either include
// `style/gapcursor.css` from the package's directory or add your own
// styles to make it visible.
const gapCursor = function() {
  return new Plugin({
    props: {
      decorations: drawGapCursor,

      createSelectionBetween(_view, $anchor, $head) {
        if ($anchor.pos == $head.pos && GapCursor.valid($head)) return new GapCursor($head)
      },

      handleClick,
      handleKeyDown
    }
  })
};

const handleKeyDown = keydownHandler({
  "ArrowLeft": arrow("horiz", -1),
  "ArrowRight": arrow("horiz", 1),
  "ArrowUp": arrow("vert", -1),
  "ArrowDown": arrow("vert", 1)
});

function arrow(axis, dir) {
  let dirStr = axis == "vert" ? (dir > 0 ? "down" : "up") : (dir > 0 ? "right" : "left");
  return function(state, dispatch, view) {
    let sel = state.selection;
    let $start = dir > 0 ? sel.$to : sel.$from, mustMove = sel.empty;
    if (sel instanceof TextSelection) {
      if (!view.endOfTextblock(dirStr) || $start.depth == 0) return false
      mustMove = false;
      $start = state.doc.resolve(dir > 0 ? $start.after() : $start.before());
    }
    let $found = GapCursor.findFrom($start, dir, mustMove);
    if (!$found) return false
    if (dispatch) dispatch(state.tr.setSelection(new GapCursor($found)));
    return true
  }
}

function handleClick(view, pos, event) {
  if (!view.editable) return false
  let $pos = view.state.doc.resolve(pos);
  if (!GapCursor.valid($pos)) return false
  let {inside} = view.posAtCoords({left: event.clientX, top: event.clientY});
  if (inside > -1 && NodeSelection.isSelectable(view.state.doc.nodeAt(inside))) return false
  view.dispatch(view.state.tr.setSelection(new GapCursor($pos)));
  return true
}

function drawGapCursor(state) {
  if (!(state.selection instanceof GapCursor)) return null
  let node = document.createElement("div");
  node.className = "ProseMirror-gapcursor";
  return DecorationSet.create(state.doc, [Decoration.widget(state.selection.head, node, {key: "gapcursor"})])
}

export { GapCursor, gapCursor };
