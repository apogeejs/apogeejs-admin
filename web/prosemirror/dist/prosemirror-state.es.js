import { Slice, Fragment, Mark, Node } from '/prosemirror/dist/prosemirror-model.es.js';
import { ReplaceStep, ReplaceAroundStep, Transform } from '/prosemirror/dist/prosemirror-transform.es.js';

const classesById = Object.create(null);

// ::- Superclass for editor selections. Every selection type should
// extend this. Should not be instantiated directly.
class Selection {
  // :: (ResolvedPos, ResolvedPos, ?[SelectionRange])
  // Initialize a selection with the head and anchor and ranges. If no
  // ranges are given, constructs a single range across `$anchor` and
  // `$head`.
  constructor($anchor, $head, ranges) {
    // :: [SelectionRange]
    // The ranges covered by the selection.
    this.ranges = ranges || [new SelectionRange($anchor.min($head), $anchor.max($head))];
    // :: ResolvedPos
    // The resolved anchor of the selection (the side that stays in
    // place when the selection is modified).
    this.$anchor = $anchor;
    // :: ResolvedPos
    // The resolved head of the selection (the side that moves when
    // the selection is modified).
    this.$head = $head;
  }

  // :: number
  // The selection's anchor, as an unresolved position.
  get anchor() { return this.$anchor.pos }

  // :: number
  // The selection's head.
  get head() { return this.$head.pos }

  // :: number
  // The lower bound of the selection's main range.
  get from() { return this.$from.pos }

  // :: number
  // The upper bound of the selection's main range.
  get to() { return this.$to.pos }

  // :: ResolvedPos
  // The resolved lower  bound of the selection's main range.
  get $from() {
    return this.ranges[0].$from
  }

  // :: ResolvedPos
  // The resolved upper bound of the selection's main range.
  get $to() {
    return this.ranges[0].$to
  }

  // :: bool
  // Indicates whether the selection contains any content.
  get empty() {
    let ranges = this.ranges;
    for (let i = 0; i < ranges.length; i++)
      if (ranges[i].$from.pos != ranges[i].$to.pos) return false
    return true
  }

  // eq:: (Selection) → bool
  // Test whether the selection is the same as another selection.

  // map:: (doc: Node, mapping: Mappable) → Selection
  // Map this selection through a [mappable](#transform.Mappable) thing. `doc`
  // should be the new document to which we are mapping.

  // :: () → Slice
  // Get the content of this selection as a slice.
  content() {
    return this.$from.node(0).slice(this.from, this.to, true)
  }

  // :: (Transaction, ?Slice)
  // Replace the selection with a slice or, if no slice is given,
  // delete the selection. Will append to the given transaction.
  replace(tr, content = Slice.empty) {
    // Put the new selection at the position after the inserted
    // content. When that ended in an inline node, search backwards,
    // to get the position after that node. If not, search forward.
    let lastNode = content.content.lastChild, lastParent = null;
    for (let i = 0; i < content.openEnd; i++) {
      lastParent = lastNode;
      lastNode = lastNode.lastChild;
    }

    let mapFrom = tr.steps.length, ranges = this.ranges;
    for (let i = 0; i < ranges.length; i++) {
      let {$from, $to} = ranges[i], mapping = tr.mapping.slice(mapFrom);
      tr.replaceRange(mapping.map($from.pos), mapping.map($to.pos), i ? Slice.empty : content);
      if (i == 0)
        selectionToInsertionEnd(tr, mapFrom, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1);
    }
  }

  // :: (Transaction, Node)
  // Replace the selection with the given node, appending the changes
  // to the given transaction.
  replaceWith(tr, node) {
    let mapFrom = tr.steps.length, ranges = this.ranges;
    for (let i = 0; i < ranges.length; i++) {
      let {$from, $to} = ranges[i], mapping = tr.mapping.slice(mapFrom);
      let from = mapping.map($from.pos), to = mapping.map($to.pos);
      if (i) {
        tr.deleteRange(from, to);
      } else {
        tr.replaceRangeWith(from, to, node);
        selectionToInsertionEnd(tr, mapFrom, node.isInline ? -1 : 1);
      }
    }
  }

  // toJSON:: () → Object
  // Convert the selection to a JSON representation. When implementing
  // this for a custom selection class, make sure to give the object a
  // `type` property whose value matches the ID under which you
  // [registered](#state.Selection^jsonID) your class.

  // :: (ResolvedPos, number, ?bool) → ?Selection
  // Find a valid cursor or leaf node selection starting at the given
  // position and searching back if `dir` is negative, and forward if
  // positive. When `textOnly` is true, only consider cursor
  // selections. Will return null when no valid selection position is
  // found.
  static findFrom($pos, dir, textOnly) {
    let inner = $pos.parent.inlineContent ? new TextSelection($pos)
        : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly);
    if (inner) return inner

    for (let depth = $pos.depth - 1; depth >= 0; depth--) {
      let found = dir < 0
          ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly)
          : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly);
      if (found) return found
    }
  }

  // :: (ResolvedPos, ?number) → Selection
  // Find a valid cursor or leaf node selection near the given
  // position. Searches forward first by default, but if `bias` is
  // negative, it will search backwards first.
  static near($pos, bias = 1) {
    return this.findFrom($pos, bias) || this.findFrom($pos, -bias) || new AllSelection($pos.node(0))
  }

  // :: (Node) → Selection
  // Find the cursor or leaf node selection closest to the start of
  // the given document. Will return an
  // [`AllSelection`](#state.AllSelection) if no valid position
  // exists.
  static atStart(doc) {
    return findSelectionIn(doc, doc, 0, 0, 1) || new AllSelection(doc)
  }

  // :: (Node) → Selection
  // Find the cursor or leaf node selection closest to the end of the
  // given document.
  static atEnd(doc) {
    return findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1) || new AllSelection(doc)
  }

  // :: (Node, Object) → Selection
  // Deserialize the JSON representation of a selection. Must be
  // implemented for custom classes (as a static class method).
  static fromJSON(doc, json) {
    if (!json || !json.type) throw new RangeError("Invalid input for Selection.fromJSON")
    let cls = classesById[json.type];
    if (!cls) throw new RangeError(`No selection type ${json.type} defined`)
    return cls.fromJSON(doc, json)
  }

  // :: (string, constructor<Selection>)
  // To be able to deserialize selections from JSON, custom selection
  // classes must register themselves with an ID string, so that they
  // can be disambiguated. Try to pick something that's unlikely to
  // clash with classes from other modules.
  static jsonID(id, selectionClass) {
    if (id in classesById) throw new RangeError("Duplicate use of selection JSON ID " + id)
    classesById[id] = selectionClass;
    selectionClass.prototype.jsonID = id;
    return selectionClass
  }

  // :: () → SelectionBookmark
  // Get a [bookmark](#state.SelectionBookmark) for this selection,
  // which is a value that can be mapped without having access to a
  // current document, and later resolved to a real selection for a
  // given document again. (This is used mostly by the history to
  // track and restore old selections.) The default implementation of
  // this method just converts the selection to a text selection and
  // returns the bookmark for that.
  getBookmark() {
    return TextSelection.between(this.$anchor, this.$head).getBookmark()
  }
}

// :: bool
// Controls whether, when a selection of this type is active in the
// browser, the selected range should be visible to the user. Defaults
// to `true`.
Selection.prototype.visible = true;

// SelectionBookmark:: interface
// A lightweight, document-independent representation of a selection.
// You can define a custom bookmark type for a custom selection class
// to make the history handle it well.
//
//   map:: (mapping: Mapping) → SelectionBookmark
//   Map the bookmark through a set of changes.
//
//   resolve:: (doc: Node) → Selection
//   Resolve the bookmark to a real selection again. This may need to
//   do some error checking and may fall back to a default (usually
//   [`TextSelection.between`](#state.TextSelection^between)) if
//   mapping made the bookmark invalid.

// ::- Represents a selected range in a document.
class SelectionRange {
  // :: (ResolvedPos, ResolvedPos)
  constructor($from, $to) {
    // :: ResolvedPos
    // The lower bound of the range.
    this.$from = $from;
    // :: ResolvedPos
    // The upper bound of the range.
    this.$to = $to;
  }
}

// ::- A text selection represents a classical editor selection, with
// a head (the moving side) and anchor (immobile side), both of which
// point into textblock nodes. It can be empty (a regular cursor
// position).
class TextSelection extends Selection {
  // :: (ResolvedPos, ?ResolvedPos)
  // Construct a text selection between the given points.
  constructor($anchor, $head = $anchor) {
    super($anchor, $head);
  }

  // :: ?ResolvedPos
  // Returns a resolved position if this is a cursor selection (an
  // empty text selection), and null otherwise.
  get $cursor() { return this.$anchor.pos == this.$head.pos ? this.$head : null }

  map(doc, mapping) {
    let $head = doc.resolve(mapping.map(this.head));
    if (!$head.parent.inlineContent) return Selection.near($head)
    let $anchor = doc.resolve(mapping.map(this.anchor));
    return new TextSelection($anchor.parent.inlineContent ? $anchor : $head, $head)
  }

  replace(tr, content = Slice.empty) {
    super.replace(tr, content);
    if (content == Slice.empty) {
      let marks = this.$from.marksAcross(this.$to);
      if (marks) tr.ensureMarks(marks);
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
    let $anchor = doc.resolve(anchor);
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
    let dPos = $anchor.pos - $head.pos;
    if (!bias || dPos) bias = dPos >= 0 ? 1 : -1;
    if (!$head.parent.inlineContent) {
      let found = Selection.findFrom($head, bias, true) || Selection.findFrom($head, -bias, true);
      if (found) $head = found.$head;
      else return Selection.near($head, bias)
    }
    if (!$anchor.parent.inlineContent) {
      if (dPos == 0) {
        $anchor = $head;
      } else {
        $anchor = (Selection.findFrom($anchor, -bias, true) || Selection.findFrom($anchor, bias, true)).$anchor;
        if (($anchor.pos < $head.pos) != (dPos < 0)) $anchor = $head;
      }
    }
    return new TextSelection($anchor, $head)
  }
}

Selection.jsonID("text", TextSelection);

class TextBookmark {
  constructor(anchor, head) {
    this.anchor = anchor;
    this.head = head;
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
class NodeSelection extends Selection {
  // :: (ResolvedPos)
  // Create a node selection. Does not verify the validity of its
  // argument.
  constructor($pos) {
    let node = $pos.nodeAfter;
    let $end = $pos.node(0).resolve($pos.pos + node.nodeSize);
    super($pos, $end);
    // :: Node The selected node.
    this.node = node;
  }

  map(doc, mapping) {
    let {deleted, pos} = mapping.mapResult(this.anchor);
    let $pos = doc.resolve(pos);
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

NodeSelection.prototype.visible = false;

Selection.jsonID("node", NodeSelection);

class NodeBookmark {
  constructor(anchor) {
    this.anchor = anchor;
  }
  map(mapping) {
    let {deleted, pos} = mapping.mapResult(this.anchor);
    return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos)
  }
  resolve(doc) {
    let $pos = doc.resolve(this.anchor), node = $pos.nodeAfter;
    if (node && NodeSelection.isSelectable(node)) return new NodeSelection($pos)
    return Selection.near($pos)
  }
}

// ::- A selection type that represents selecting the whole document
// (which can not necessarily be expressed with a text selection, when
// there are for example leaf block nodes at the start or end of the
// document).
class AllSelection extends Selection {
  // :: (Node)
  // Create an all-selection over the given document.
  constructor(doc) {
    super(doc.resolve(0), doc.resolve(doc.content.size));
  }

  replace(tr, content = Slice.empty) {
    if (content == Slice.empty) {
      tr.delete(0, tr.doc.content.size);
      let sel = Selection.atStart(tr.doc);
      if (!sel.eq(tr.selection)) tr.setSelection(sel);
    } else {
      super.replace(tr, content);
    }
  }

  toJSON() { return {type: "all"} }

  static fromJSON(doc) { return new AllSelection(doc) }

  map(doc) { return new AllSelection(doc) }

  eq(other) { return other instanceof AllSelection }

  getBookmark() { return AllBookmark }
}

Selection.jsonID("all", AllSelection);

const AllBookmark = {
  map() { return this },
  resolve(doc) { return new AllSelection(doc) }
};

// FIXME we'll need some awareness of text direction when scanning for selections

// Try to find a selection inside the given node. `pos` points at the
// position where the search starts. When `text` is true, only return
// text selections.
function findSelectionIn(doc, node, pos, index, dir, text) {
  if (node.inlineContent) return TextSelection.create(doc, pos)
  for (let i = index - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
    let child = node.child(i);
    if (!child.isAtom) {
      let inner = findSelectionIn(doc, child, pos + dir, dir < 0 ? child.childCount : 0, dir, text);
      if (inner) return inner
    } else if (!text && NodeSelection.isSelectable(child)) {
      return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0))
    }
    pos += child.nodeSize * dir;
  }
}

function selectionToInsertionEnd(tr, startLen, bias) {
  let last = tr.steps.length - 1;
  if (last < startLen) return
  let step = tr.steps[last];
  if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) return
  let map = tr.mapping.maps[last], end;
  map.forEach((_from, _to, _newFrom, newTo) => { if (end == null) end = newTo; });
  tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
}

const UPDATED_SEL = 1, UPDATED_MARKS = 2, UPDATED_SCROLL = 4;

// ::- An editor state transaction, which can be applied to a state to
// create an updated state. Use
// [`EditorState.tr`](#state.EditorState.tr) to create an instance.
//
// Transactions track changes to the document (they are a subclass of
// [`Transform`](#transform.Transform)), but also other state changes,
// like selection updates and adjustments of the set of [stored
// marks](#state.EditorState.storedMarks). In addition, you can store
// metadata properties in a transaction, which are extra pieces of
// information that client code or plugins can use to describe what a
// transacion represents, so that they can update their [own
// state](#state.StateField) accordingly.
//
// The [editor view](#view.EditorView) uses a few metadata properties:
// it will attach a property `"pointer"` with the value `true` to
// selection transactions directly caused by mouse or touch input, and
// a `"uiEvent"` property of that may be `"paste"`, `"cut"`, or `"drop"`.
class Transaction extends Transform {
  constructor(state) {
    super(state.doc);
    // :: number
    // The timestamp associated with this transaction, in the same
    // format as `Date.now()`.
    this.time = Date.now();
    this.curSelection = state.selection;
    // The step count for which the current selection is valid.
    this.curSelectionFor = 0;
    // :: ?[Mark]
    // The stored marks set by this transaction, if any.
    this.storedMarks = state.storedMarks;
    // Bitfield to track which aspects of the state were updated by
    // this transaction.
    this.updated = 0;
    // Object used to store metadata properties for the transaction.
    this.meta = Object.create(null);
  }

  // :: Selection
  // The transaction's current selection. This defaults to the editor
  // selection [mapped](#state.Selection.map) through the steps in the
  // transaction, but can be overwritten with
  // [`setSelection`](#state.Transaction.setSelection).
  get selection() {
    if (this.curSelectionFor < this.steps.length) {
      this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor));
      this.curSelectionFor = this.steps.length;
    }
    return this.curSelection
  }

  // :: (Selection) → Transaction
  // Update the transaction's current selection. Will determine the
  // selection that the editor gets when the transaction is applied.
  setSelection(selection) {
    if (selection.$from.doc != this.doc)
      throw new RangeError("Selection passed to setSelection must point at the current document")
    this.curSelection = selection;
    this.curSelectionFor = this.steps.length;
    this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS;
    this.storedMarks = null;
    return this
  }

  // :: bool
  // Whether the selection was explicitly updated by this transaction.
  get selectionSet() {
    return (this.updated & UPDATED_SEL) > 0
  }

  // :: (?[Mark]) → Transaction
  // Set the current stored marks.
  setStoredMarks(marks) {
    this.storedMarks = marks;
    this.updated |= UPDATED_MARKS;
    return this
  }

  // :: ([Mark]) → Transaction
  // Make sure the current stored marks or, if that is null, the marks
  // at the selection, match the given set of marks. Does nothing if
  // this is already the case.
  ensureMarks(marks) {
    if (!Mark.sameSet(this.storedMarks || this.selection.$from.marks(), marks))
      this.setStoredMarks(marks);
    return this
  }

  // :: (Mark) → Transaction
  // Add a mark to the set of stored marks.
  addStoredMark(mark) {
    return this.ensureMarks(mark.addToSet(this.storedMarks || this.selection.$head.marks()))
  }

  // :: (union<Mark, MarkType>) → Transaction
  // Remove a mark or mark type from the set of stored marks.
  removeStoredMark(mark) {
    return this.ensureMarks(mark.removeFromSet(this.storedMarks || this.selection.$head.marks()))
  }

  // :: bool
  // Whether the stored marks were explicitly set for this transaction.
  get storedMarksSet() {
    return (this.updated & UPDATED_MARKS) > 0
  }

  addStep(step, doc) {
    super.addStep(step, doc);
    this.updated = this.updated & ~UPDATED_MARKS;
    this.storedMarks = null;
  }

  // :: (number) → Transaction
  // Update the timestamp for the transaction.
  setTime(time) {
    this.time = time;
    return this
  }

  // :: (Slice) → Transaction
  // Replace the current selection with the given slice.
  replaceSelection(slice) {
    this.selection.replace(this, slice);
    return this
  }

  // :: (Node, ?bool) → Transaction
  // Replace the selection with the given node. When `inheritMarks` is
  // true and the content is inline, it inherits the marks from the
  // place where it is inserted.
  replaceSelectionWith(node, inheritMarks) {
    let selection = this.selection;
    if (inheritMarks !== false)
      node = node.mark(this.storedMarks || (selection.empty ? selection.$from.marks() : (selection.$from.marksAcross(selection.$to) || Mark.none)));
    selection.replaceWith(this, node);
    return this
  }

  // :: () → Transaction
  // Delete the selection.
  deleteSelection() {
    this.selection.replace(this);
    return this
  }

  // :: (string, from: ?number, to: ?number) → Transaction
  // Replace the given range, or the selection if no range is given,
  // with a text node containing the given string.
  insertText(text, from, to = from) {
    let schema = this.doc.type.schema;
    if (from == null) {
      if (!text) return this.deleteSelection()
      return this.replaceSelectionWith(schema.text(text), true)
    } else {
      if (!text) return this.deleteRange(from, to)
      let marks = this.storedMarks;
      if (!marks) {
        let $from = this.doc.resolve(from);
        marks = to == from ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
      }
      this.replaceRangeWith(from, to, schema.text(text, marks));
      if (!this.selection.empty) this.setSelection(Selection.near(this.selection.$to));
      return this
    }
  }

  // :: (union<string, Plugin, PluginKey>, any) → Transaction
  // Store a metadata property in this transaction, keyed either by
  // name or by plugin.
  setMeta(key, value) {
    this.meta[typeof key == "string" ? key : key.key] = value;
    return this
  }

  // :: (union<string, Plugin, PluginKey>) → any
  // Retrieve a metadata property for a given name or plugin.
  getMeta(key) {
    return this.meta[typeof key == "string" ? key : key.key]
  }

  // :: bool
  // Returns true if this transaction doesn't contain any metadata,
  // and can thus safely be extended.
  get isGeneric() {
    for (let _ in this.meta) return false
    return true
  }

  // :: () → Transaction
  // Indicate that the editor should scroll the selection into view
  // when updated to the state produced by this transaction.
  scrollIntoView() {
    this.updated |= UPDATED_SCROLL;
    return this
  }

  get scrolledIntoView() {
    return (this.updated & UPDATED_SCROLL) > 0
  }
}

function bind(f, self) {
  return !self || !f ? f : f.bind(self)
}

class FieldDesc {
  constructor(name, desc, self) {
    this.name = name;
    this.init = bind(desc.init, self);
    this.apply = bind(desc.apply, self);
  }
}

const baseFields = [
  new FieldDesc("doc", {
    init(config) { return config.doc || config.schema.topNodeType.createAndFill() },
    apply(tr) { return tr.doc }
  }),

  new FieldDesc("selection", {
    init(config, instance) { return config.selection || Selection.atStart(instance.doc) },
    apply(tr) { return tr.selection }
  }),

  new FieldDesc("storedMarks", {
    init(config) { return config.storedMarks || null },
    apply(tr, _marks, _old, state) { return state.selection.$cursor ? tr.storedMarks : null }
  }),

  new FieldDesc("scrollToSelection", {
    init() { return 0 },
    apply(tr, prev) { return tr.scrolledIntoView ? prev + 1 : prev }
  })
];

// Object wrapping the part of a state object that stays the same
// across transactions. Stored in the state's `config` property.
class Configuration {
  constructor(schema, plugins) {
    this.schema = schema;
    this.fields = baseFields.concat();
    this.plugins = [];
    this.pluginsByKey = Object.create(null);
    if (plugins) plugins.forEach(plugin => {
      if (this.pluginsByKey[plugin.key])
        throw new RangeError("Adding different instances of a keyed plugin (" + plugin.key + ")")
      this.plugins.push(plugin);
      this.pluginsByKey[plugin.key] = plugin;
      if (plugin.spec.state)
        this.fields.push(new FieldDesc(plugin.key, plugin.spec.state, plugin));
    });
  }
}

// ::- The state of a ProseMirror editor is represented by an object
// of this type. A state is a persistent data structure—it isn't
// updated, but rather a new state value is computed from an old one
// using the [`apply`](#state.EditorState.apply) method.
//
// A state holds a number of built-in fields, and plugins can
// [define](#state.PluginSpec.state) additional fields.
class EditorState {
  constructor(config) {
    this.config = config;
  }

  // doc:: Node
  // The current document.

  // selection:: Selection
  // The selection.

  // storedMarks:: ?[Mark]
  // A set of marks to apply to the next input. Will be null when
  // no explicit marks have been set.

  // :: Schema
  // The schema of the state's document.
  get schema() {
    return this.config.schema
  }

  // :: [Plugin]
  // The plugins that are active in this state.
  get plugins() {
    return this.config.plugins
  }

  // :: (Transaction) → EditorState
  // Apply the given transaction to produce a new state.
  apply(tr) {
    return this.applyTransaction(tr).state
  }

  // : (Transaction) → bool
  filterTransaction(tr, ignore = -1) {
    for (let i = 0; i < this.config.plugins.length; i++) if (i != ignore) {
      let plugin = this.config.plugins[i];
      if (plugin.spec.filterTransaction && !plugin.spec.filterTransaction.call(plugin, tr, this))
        return false
    }
    return true
  }

  // :: (Transaction) → {state: EditorState, transactions: [Transaction]}
  // Verbose variant of [`apply`](#state.EditorState.apply) that
  // returns the precise transactions that were applied (which might
  // be influenced by the [transaction
  // hooks](#state.PluginSpec.filterTransaction) of
  // plugins) along with the new state.
  applyTransaction(rootTr) {
    if (!this.filterTransaction(rootTr)) return {state: this, transactions: []}

    let trs = [rootTr], newState = this.applyInner(rootTr), seen = null;
    // This loop repeatedly gives plugins a chance to respond to
    // transactions as new transactions are added, making sure to only
    // pass the transactions the plugin did not see before.
     for (;;) {
      let haveNew = false;
      for (let i = 0; i < this.config.plugins.length; i++) {
        let plugin = this.config.plugins[i];
        if (plugin.spec.appendTransaction) {
          let n = seen ? seen[i].n : 0, oldState = seen ? seen[i].state : this;
          let tr = n < trs.length &&
              plugin.spec.appendTransaction.call(plugin, n ? trs.slice(n) : trs, oldState, newState);
          if (tr && newState.filterTransaction(tr, i)) {
            tr.setMeta("appendedTransaction", rootTr);
            if (!seen) {
              seen = [];
              for (let j = 0; j < this.config.plugins.length; j++)
                seen.push(j < i ? {state: newState, n: trs.length} : {state: this, n: 0});
            }
            trs.push(tr);
            newState = newState.applyInner(tr);
            haveNew = true;
          }
          if (seen) seen[i] = {state: newState, n: trs.length};
        }
      }
      if (!haveNew) return {state: newState, transactions: trs}
    }
  }

  // : (Transaction) → EditorState
  applyInner(tr) {
    if (!tr.before.eq(this.doc)) throw new RangeError("Applying a mismatched transaction")
    let newInstance = new EditorState(this.config), fields = this.config.fields;
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      newInstance[field.name] = field.apply(tr, this[field.name], this, newInstance);
    }
    for (let i = 0; i < applyListeners.length; i++) applyListeners[i](this, tr, newInstance);
    return newInstance
  }

  // :: Transaction
  // Start a [transaction](#state.Transaction) from this state.
  get tr() { return new Transaction(this) }

  // :: (Object) → EditorState
  // Create a new state.
  //
  //   config::- Configuration options. Must contain `schema` or `doc` (or both).
  //
  //      schema:: ?Schema
  //      The schema to use.
  //
  //      doc:: ?Node
  //      The starting document.
  //
  //      selection:: ?Selection
  //      A valid selection in the document.
  //
  //      storedMarks:: ?[Mark]
  //      The initial set of [stored marks](#state.EditorState.storedMarks).
  //
  //      plugins:: ?[Plugin]
  //      The plugins that should be active in this state.
  static create(config) {
    let $config = new Configuration(config.schema || config.doc.type.schema, config.plugins);
    let instance = new EditorState($config);
    for (let i = 0; i < $config.fields.length; i++)
      instance[$config.fields[i].name] = $config.fields[i].init(config, instance);
    return instance
  }

  // :: (Object) → EditorState
  // Create a new state based on this one, but with an adjusted set of
  // active plugins. State fields that exist in both sets of plugins
  // are kept unchanged. Those that no longer exist are dropped, and
  // those that are new are initialized using their
  // [`init`](#state.StateField.init) method, passing in the new
  // configuration object..
  //
  //   config::- configuration options
  //
  //     schema:: ?Schema
  //     New schema to use.
  //
  //     plugins:: ?[Plugin]
  //     New set of active plugins.
  reconfigure(config) {
    let $config = new Configuration(config.schema || this.schema, config.plugins);
    let fields = $config.fields, instance = new EditorState($config);
    for (let i = 0; i < fields.length; i++) {
      let name = fields[i].name;
      instance[name] = this.hasOwnProperty(name) ? this[name] : fields[i].init(config, instance);
    }
    return instance
  }

  // :: (?union<Object<Plugin>, string, number>) → Object
  // Serialize this state to JSON. If you want to serialize the state
  // of plugins, pass an object mapping property names to use in the
  // resulting JSON object to plugin objects. The argument may also be
  // a string or number, in which case it is ignored, to support the
  // way `JSON.stringify` calls `toString` methods.
  toJSON(pluginFields) {
    let result = {doc: this.doc.toJSON(), selection: this.selection.toJSON()};
    if (this.storedMarks) result.storedMarks = this.storedMarks.map(m => m.toJSON());
    if (pluginFields && typeof pluginFields == 'object') for (let prop in pluginFields) {
      if (prop == "doc" || prop == "selection")
        throw new RangeError("The JSON fields `doc` and `selection` are reserved")
      let plugin = pluginFields[prop], state = plugin.spec.state;
      if (state && state.toJSON) result[prop] = state.toJSON.call(plugin, this[plugin.key]);
    }
    return result
  }

  // :: (Object, Object, ?Object<Plugin>) → EditorState
  // Deserialize a JSON representation of a state. `config` should
  // have at least a `schema` field, and should contain array of
  // plugins to initialize the state with. `pluginFields` can be used
  // to deserialize the state of plugins, by associating plugin
  // instances with the property names they use in the JSON object.
  //
  //   config::- configuration options
  //
  //     schema:: Schema
  //     The schema to use.
  //
  //     plugins:: ?[Plugin]
  //     The set of active plugins.
  static fromJSON(config, json, pluginFields) {
    if (!json) throw new RangeError("Invalid input for EditorState.fromJSON")
    if (!config.schema) throw new RangeError("Required config field 'schema' missing")
    let $config = new Configuration(config.schema, config.plugins);
    let instance = new EditorState($config);
    $config.fields.forEach(field => {
      if (field.name == "doc") {
        instance.doc = Node.fromJSON(config.schema, json.doc);
      } else if (field.name == "selection") {
        instance.selection = Selection.fromJSON(instance.doc, json.selection);
      } else if (field.name == "storedMarks") {
        if (json.storedMarks) instance.storedMarks = json.storedMarks.map(config.schema.markFromJSON);
      } else {
        if (pluginFields) for (let prop in pluginFields) {
          let plugin = pluginFields[prop], state = plugin.spec.state;
          if (plugin.key == field.name && state && state.fromJSON &&
              Object.prototype.hasOwnProperty.call(json, prop)) {
            // This field belongs to a plugin mapped to a JSON field, read it from there.
            instance[field.name] = state.fromJSON.call(plugin, config, json[prop], instance);
            return
          }
        }
        instance[field.name] = field.init(config, instance);
      }
    });
    return instance
  }

  // Kludge to allow the view to track mappings between different
  // instances of a state.
  //
  // FIXME this is no longer needed as of prosemirror-view 1.9.0,
  // though due to backwards-compat we should probably keep it around
  // for a while (if only as a no-op)
  static addApplyListener(f) {
    applyListeners.push(f);
  }
  static removeApplyListener(f) {
    let found = applyListeners.indexOf(f);
    if (found > -1) applyListeners.splice(found, 1);
  }
}

const applyListeners = [];

// PluginSpec:: interface
//
// This is the type passed to the [`Plugin`](#state.Plugin)
// constructor. It provides a definition for a plugin.
//
//   props:: ?EditorProps
//   The [view props](#view.EditorProps) added by this plugin. Props
//   that are functions will be bound to have the plugin instance as
//   their `this` binding.
//
//   state:: ?StateField<any>
//   Allows a plugin to define a [state field](#state.StateField), an
//   extra slot in the state object in which it can keep its own data.
//
//   key:: ?PluginKey
//   Can be used to make this a keyed plugin. You can have only one
//   plugin with a given key in a given state, but it is possible to
//   access the plugin's configuration and state through the key,
//   without having access to the plugin instance object.
//
//   view:: ?(EditorView) → Object
//   When the plugin needs to interact with the editor view, or
//   set something up in the DOM, use this field. The function
//   will be called when the plugin's state is associated with an
//   editor view.
//
//     return::-
//     Should return an object with the following optional
//     properties:
//
//       update:: ?(view: EditorView, prevState: EditorState)
//       Called whenever the view's state is updated.
//
//       destroy:: ?()
//       Called when the view is destroyed or receives a state
//       with different plugins.
//
//   filterTransaction:: ?(Transaction, EditorState) → bool
//   When present, this will be called before a transaction is
//   applied by the state, allowing the plugin to cancel it (by
//   returning false).
//
//   appendTransaction:: ?(transactions: [Transaction], oldState: EditorState, newState: EditorState) → ?Transaction
//   Allows the plugin to append another transaction to be applied
//   after the given array of transactions. When another plugin
//   appends a transaction after this was called, it is called again
//   with the new state and new transactions—but only the new
//   transactions, i.e. it won't be passed transactions that it
//   already saw.

function bindProps(obj, self, target) {
  for (let prop in obj) {
    let val = obj[prop];
    if (val instanceof Function) val = val.bind(self);
    else if (prop == "handleDOMEvents") val = bindProps(val, self, {});
    target[prop] = val;
  }
  return target
}

// ::- Plugins bundle functionality that can be added to an editor.
// They are part of the [editor state](#state.EditorState) and
// may influence that state and the view that contains it.
class Plugin {
  // :: (PluginSpec)
  // Create a plugin.
  constructor(spec) {
    // :: EditorProps
    // The [props](#view.EditorProps) exported by this plugin.
    this.props = {};
    if (spec.props) bindProps(spec.props, this, this.props);
    // :: Object
    // The plugin's [spec object](#state.PluginSpec).
    this.spec = spec;
    this.key = spec.key ? spec.key.key : createKey("plugin");
  }

  // :: (EditorState) → any
  // Extract the plugin's state field from an editor state.
  getState(state) { return state[this.key] }
}

// StateField:: interface<T>
// A plugin spec may provide a state field (under its
// [`state`](#state.PluginSpec.state) property) of this type, which
// describes the state it wants to keep. Functions provided here are
// always called with the plugin instance as their `this` binding.
//
//   init:: (config: Object, instance: EditorState) → T
//   Initialize the value of the field. `config` will be the object
//   passed to [`EditorState.create`](#state.EditorState^create). Note
//   that `instance` is a half-initialized state instance, and will
//   not have values for plugin fields initialized after this one.
//
//   apply:: (tr: Transaction, value: T, oldState: EditorState, newState: EditorState) → T
//   Apply the given transaction to this state field, producing a new
//   field value. Note that the `newState` argument is again a partially
//   constructed state does not yet contain the state from plugins
//   coming after this one.
//
//   toJSON:: ?(value: T) → *
//   Convert this field to JSON. Optional, can be left off to disable
//   JSON serialization for the field.
//
//   fromJSON:: ?(config: Object, value: *, state: EditorState) → T
//   Deserialize the JSON representation of this field. Note that the
//   `state` argument is again a half-initialized state.

const keys = Object.create(null);

function createKey(name) {
  if (name in keys) return name + "$" + ++keys[name]
  keys[name] = 0;
  return name + "$"
}

// ::- A key is used to [tag](#state.PluginSpec.key)
// plugins in a way that makes it possible to find them, given an
// editor state. Assigning a key does mean only one plugin of that
// type can be active in a state.
class PluginKey {
  // :: (?string)
  // Create a plugin key.
  constructor(name = "key") { this.key = createKey(name); }

  // :: (EditorState) → ?Plugin
  // Get the active plugin with this key, if any, from an editor
  // state.
  get(state) { return state.config.pluginsByKey[this.key] }

  // :: (EditorState) → ?any
  // Get the plugin's state from an editor state.
  getState(state) { return state[this.key] }
}

export { AllSelection, EditorState, NodeSelection, Plugin, PluginKey, Selection, SelectionRange, TextSelection, Transaction };
