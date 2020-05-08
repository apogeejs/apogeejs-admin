//THIS IS A DEAD END RIGHT NOW!!!


import {Selection} from "../../prosemirror-state/src/index.js"
import {Slice} from "../../prosemirror-model/src/index.js"
import {TextSelection, NodeSelection, Plugin} from "../../prosemirror-state/src/index.js"

/** This is the pluging to add the compound selection to the editor. */
export const CompoundSelectionPlugin = function() {
    return new Plugin({
      props: {
        createSelectionBetween(_view, $anchor, $head) {
          if ($anchor.pos == $head.pos && GapCursor.valid($head)) return new GapCursor($head)
        },
      }
    })
  }
  

/** This plug allows for a compound selection by adding the selection of any additional nodes
 * to the given text selection in the given range. */
export class CompoundSelection extends Selection {
  // : (ResolvedPos)
  constructor($anchor, $head) {
    super($anchor, $head);
  }

  map(doc, mapping) {
    let $head = doc.resolve(mapping.map(this.head))
    let $anchor = doc.resolve(mapping.map(this.anchor))
    return new CompoundSelection($anchor, $head)
  }

  //keep the standard content

  //do the same replace as text selection - test this
  replace(tr, content = Slice.empty) {
    super.replace(tr, content)
    if (content == Slice.empty) {
      let marks = this.$from.marksAcross(this.$to)
      if (marks) tr.ensureMarks(marks)
    }
  }

  eq(other) {
    return other instanceof CompoundSelection && other.anchor == this.anchor && other.head == this.head
  }

  getBookmark() {
    return new CompoundBookmark(this.anchor, this.head)
  }

  toJSON() {
    return {type: "compound", anchor: this.anchor, head: this.head}
  }

  static fromJSON(doc, json) {
    if (typeof json.anchor != "number" || typeof json.head != "number")
      throw new RangeError("Invalid input for CompoundSelection.fromJSON")
    return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head))
  }

  //////////////////////////////

  static valid($pos) {
    let parent = $pos.parent
    if (parent.isTextblock || !closedBefore($pos) || !closedAfter($pos)) return false
    let override = parent.type.spec.allowGapCursor
    if (override != null) return override
    let deflt = parent.contentMatchAt($pos.index()).defaultType
    return deflt && deflt.isTextblock
  }

  static findFrom($pos, dir, mustMove) {
    if (!mustMove && GapCursor.valid($pos)) return $pos

    let pos = $pos.pos, next = null
    // Scan up from this position
    for (let d = $pos.depth;; d--) {
      let parent = $pos.node(d)
      if (dir > 0 ? $pos.indexAfter(d) < parent.childCount : $pos.index(d) > 0) {
        next = parent.maybeChild(dir > 0 ? $pos.indexAfter(d) : $pos.index(d) - 1)
        break
      } else if (d == 0) {
        return null
      }
      pos += dir
      let $cur = $pos.doc.resolve(pos)
      if (GapCursor.valid($cur)) return $cur
    }

    // And then down into the next node
    for (;;) {
      next = dir > 0 ? next.firstChild : next.lastChild
      if (!next) break
      pos += dir
      let $cur = $pos.doc.resolve(pos)
      if (GapCursor.valid($cur)) return $cur
    }

    return null
  }
}

Selection.jsonID("compound", CompoundSelection)

class CompoundBookmark {
    constructor(anchor, head) {
        this.anchor = anchor
        this.head = head
    }
    map(mapping) {
        return new CompoundBookmark(mapping.map(this.anchor), mapping.map(this.head))
    }
    resolve(doc) {
        return CompoundBookmark.between(doc.resolve(this.anchor), doc.resolve(this.head))
    }
}

//////////////////////////////////////////////////////////////////////////////

class GapBookmark {
  constructor(pos) {
    this.pos = pos
  }
  map(mapping) {
    return new GapBookmark(mapping.map(this.pos))
  }
  resolve(doc) {
    let $pos = doc.resolve(this.pos)
    return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos)
  }
}

function closedBefore($pos) {
  for (let d = $pos.depth; d >= 0; d--) {
    let index = $pos.index(d)
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
    let index = $pos.indexAfter(d), parent = $pos.node(d)
    if (index == parent.childCount) continue
    for (let after = parent.child(index);; after = after.firstChild) {
      if ((after.childCount == 0 && !after.inlineContent) || after.isAtom || after.type.spec.isolating) return true
      if (after.inlineContent) return false
    }
  }
  return true
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// ::- A text selection represents a classical editor selection, with
// a head (the moving side) and anchor (immobile side), both of which
// point into textblock nodes. It can be empty (a regular cursor
// position).
export class TextSelection extends Selection {
    // :: (ResolvedPos, ?ResolvedPos)
    // Construct a text selection between the given points.
    constructor($anchor, $head = $anchor) {
      super($anchor, $head)
    }
  
    // :: ?ResolvedPos
    // Returns a resolved position if this is a cursor selection (an
    // empty text selection), and null otherwise.
    get $cursor() { return this.$anchor.pos == this.$head.pos ? this.$head : null }
  
    map(doc, mapping) {
      let $head = doc.resolve(mapping.map(this.head))
      if (!$head.parent.inlineContent) return Selection.near($head)
      let $anchor = doc.resolve(mapping.map(this.anchor))
      return new TextSelection($anchor.parent.inlineContent ? $anchor : $head, $head)
    }
  
    replace(tr, content = Slice.empty) {
      super.replace(tr, content)
      if (content == Slice.empty) {
        let marks = this.$from.marksAcross(this.$to)
        if (marks) tr.ensureMarks(marks)
      }
    }
  
    eq(other) {
      return other instanceof TextSelection && other.anchor == this.anchor && other.head == this.head
    }
  
    getBookmark() {
      return new TextBookmark(this.anchor, this.head)
    }
  
    toJSON() {
      return {type: "text", anchor: this.anchor, head: this.head}
    }
  
    static fromJSON(doc, json) {
      if (typeof json.anchor != "number" || typeof json.head != "number")
        throw new RangeError("Invalid input for TextSelection.fromJSON")
      return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head))
    }
  
    // :: (Node, number, ?number) → TextSelection
    // Create a text selection from non-resolved positions.
    static create(doc, anchor, head = anchor) {
      let $anchor = doc.resolve(anchor)
      return new this($anchor, head == anchor ? $anchor : doc.resolve(head))
    }
  
    // :: (ResolvedPos, ResolvedPos, ?number) → Selection
    // Return a text selection that spans the given positions or, if
    // they aren't text positions, find a text selection near them.
    // `bias` determines whether the method searches forward (default)
    // or backwards (negative number) first. Will fall back to calling
    // [`Selection.near`](#state.Selection^near) when the document
    // doesn't contain a valid text position.
    static between($anchor, $head, bias) {
      let dPos = $anchor.pos - $head.pos
      if (!bias || dPos) bias = dPos >= 0 ? 1 : -1
      if (!$head.parent.inlineContent) {
        let found = Selection.findFrom($head, bias, true) || Selection.findFrom($head, -bias, true)
        if (found) $head = found.$head
        else return Selection.near($head, bias)
      }
      if (!$anchor.parent.inlineContent) {
        if (dPos == 0) {
          $anchor = $head
        } else {
          $anchor = (Selection.findFrom($anchor, -bias, true) || Selection.findFrom($anchor, bias, true)).$anchor
          if (($anchor.pos < $head.pos) != (dPos < 0)) $anchor = $head
        }
      }
      return new TextSelection($anchor, $head)
    }
  }
  
  Selection.jsonID("text", TextSelection)
  
  class TextBookmark {
    constructor(anchor, head) {
      this.anchor = anchor
      this.head = head
    }
    map(mapping) {
      return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head))
    }
    resolve(doc) {
      return TextSelection.between(doc.resolve(this.anchor), doc.resolve(this.head))
    }
  }
  
  // ::- A node selection is a selection that points at a single node.
  // All nodes marked [selectable](#model.NodeSpec.selectable) can be
  // the target of a node selection. In such a selection, `from` and
  // `to` point directly before and after the selected node, `anchor`
  // equals `from`, and `head` equals `to`..
  export class NodeSelection extends Selection {
    // :: (ResolvedPos)
    // Create a node selection. Does not verify the validity of its
    // argument.
    constructor($pos) {
      let node = $pos.nodeAfter
      let $end = $pos.node(0).resolve($pos.pos + node.nodeSize)
      super($pos, $end)
      // :: Node The selected node.
      this.node = node
    }
  
    map(doc, mapping) {
      let {deleted, pos} = mapping.mapResult(this.anchor)
      let $pos = doc.resolve(pos)
      if (deleted) return Selection.near($pos)
      return new NodeSelection($pos)
    }
  
    content() {
      return new Slice(Fragment.from(this.node), 0, 0)
    }
  
    eq(other) {
      return other instanceof NodeSelection && other.anchor == this.anchor
    }
  
    toJSON() {
      return {type: "node", anchor: this.anchor}
    }
  
    getBookmark() { return new NodeBookmark(this.anchor) }
  
    static fromJSON(doc, json) {
      if (typeof json.anchor != "number")
        throw new RangeError("Invalid input for NodeSelection.fromJSON")
      return new NodeSelection(doc.resolve(json.anchor))
    }
  
    // :: (Node, number) → NodeSelection
    // Create a node selection from non-resolved positions.
    static create(doc, from) {
      return new this(doc.resolve(from))
    }
  
    // :: (Node) → bool
    // Determines whether the given node may be selected as a node
    // selection.
    static isSelectable(node) {
      return !node.isText && node.type.spec.selectable !== false
    }
  }
  
  NodeSelection.prototype.visible = false
  
  Selection.jsonID("node", NodeSelection)
  
  class NodeBookmark {
    constructor(anchor) {
      this.anchor = anchor
    }
    map(mapping) {
      let {deleted, pos} = mapping.mapResult(this.anchor)
      return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos)
    }
    resolve(doc) {
      let $pos = doc.resolve(this.anchor), node = $pos.nodeAfter
      if (node && NodeSelection.isSelectable(node)) return new NodeSelection($pos)
      return Selection.near($pos)
    }
  }
