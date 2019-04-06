
//---------------------------
// start utilities
//---------------------------

//===================================
// This is used to detect changes in the editor. I might want to handle this differently
//===================================

function computeChange(oldVal, newVal) {
  if (oldVal == newVal) return null
  let start = 0, oldEnd = oldVal.length, newEnd = newVal.length
  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start)) ++start
  while (oldEnd > start && newEnd > start &&
         oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)) { oldEnd--; newEnd-- }
  return {from: start, to: oldEnd, text: newVal.slice(start, newEnd)}
}

//===============================
// some special key mapping for transitions between editors (which I might not want)
//===============================

const {keymap} = require("prosemirror-keymap")

function arrowHandler(dir) {
  return (state, dispatch, view) => {
    if (state.selection.empty && view.endOfTextblock(dir)) {
      let side = dir == "left" || dir == "up" ? -1 : 1, $head = state.selection.$head
      let nextPos = Selection.near(state.doc.resolve(side > 0 ? $head.after() : $head.before()), side)
      if (nextPos.$head && nextPos.$head.parent.type.name == "code_block") {
        dispatch(state.tr.setSelection(nextPos))
        return true
      }
    }
    return false
  }
}

const arrowHandlers = keymap({
  ArrowLeft: arrowHandler("left"),
  ArrowRight: arrowHandler("right"),
  ArrowUp: arrowHandler("up"),
  ArrowDown: arrowHandler("down")
})

//---------------------------
// end utilities
//---------------------------


//=======================
// Create the schema - use the basic schema - code block is already there
//=======================

const {Schema} = require("prosemirror-model")
const {schema} = require("prosemirror-schema-basic")

//const footnoteSpec = {
//  group: "inline",
//  content: "inline*",
//  inline: true,
//  draggable: true,
//  // This makes the view treat the node as a leaf, even though it
//  // technically has content
//  atom: true,
//  toDOM: () => ["footnote", 0],
//  parseDOM: [{tag: "footnote"}]
//}

var baseNodes = schema.spec.nodes;
var mySchema = new Schema({
  nodes: baseNodes.update("code_block", Object.assign(
    {}, baseNodes.get("code_block"), {isolating: true})),
  marks: schema.spec.marks
});


//no command - already there
////===================
////add footnoe command
////===================
//
//const {insertPoint} = require("prosemirror-transform")
//const {MenuItem} = require("prosemirror-menu")
//const {buildMenuItems} = require("prosemirror-example-setup")
//const {Fragment} = require("prosemirror-model")
//
//let menu = buildMenuItems(footnoteSchema)
//menu.insertMenu.content.push(new MenuItem({
//  title: "Insert footnote",
//  label: "Footnote",
//  select(state) {
//    return insertPoint(state.doc, state.selection.from, footnoteSchema.nodes.footnote) != null
//  },
//  run(state, dispatch) {
//    let {empty, $from, $to} = state.selection, content = Fragment.empty
//    if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
//      content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
//    dispatch(state.tr.replaceSelectionWith(footnoteSchema.nodes.footnote.create(null, content)))
//  }
//}))


//=======================
// Create the code block view
//=======================

const {Selection, TextSelection} = require("prosemirror-state")
const {exitCode} = require("prosemirror-commands")
const {undo, redo} = require("prosemirror-history")

class CodeBlockView {
  constructor(node, view, getPos) {
    // Store for later
    this.node = node
    this.view = view
    this.getPos = getPos
    this.incomingChanges = false

    // Create a CodeMirror instance
    this.cm = new CodeMirror(null, {
      value: this.node.textContent,
      lineNumbers: true,
      extraKeys: this.codeMirrorKeymap()
    })

    // The editor's outer node is our DOM representation
    this.dom = this.cm.getWrapperElement()
    // CodeMirror needs to be in the DOM to properly initialize, so
    // schedule it to update itself
    setTimeout(() => this.cm.refresh(), 20)

    // This flag is used to avoid an update loop between the outer and
    // inner editor
    this.updating = false
    // Track whether changes are have been made but not yet propagated
    this.cm.on("beforeChange", () => this.incomingChanges = true)
    // Propagate updates from the code editor to ProseMirror
    this.cm.on("cursorActivity", () => {
      if (!this.updating && !this.incomingChanges) this.forwardSelection()
    })
    this.cm.on("changes", () => {
      if (!this.updating) {
        this.valueChanged()
        this.forwardSelection()
      }
      this.incomingChanges = false
    })
    this.cm.on("focus", () => this.forwardSelection())
  }
  
  forwardSelection() {
    if (!this.cm.hasFocus()) return
    let state = this.view.state
    let selection = this.asProseMirrorSelection(state.doc)
    if (!selection.eq(state.selection))
      this.view.dispatch(state.tr.setSelection(selection))
  }
  
  asProseMirrorSelection(doc) {
    let offset = this.getPos() + 1
    let anchor = this.cm.indexFromPos(this.cm.getCursor("anchor")) + offset
    let head = this.cm.indexFromPos(this.cm.getCursor("head")) + offset
    return TextSelection.create(doc, anchor, head)
  }

  setSelection(anchor, head) {
    this.cm.focus()
    this.updating = true
    this.cm.setSelection(this.cm.posFromIndex(anchor),
                         this.cm.posFromIndex(head))
    this.updating = false
  }
  
  valueChanged() {
    let change = computeChange(this.node.textContent, this.cm.getValue())
    if (change) {
      let start = this.getPos() + 1
      let tr = this.view.state.tr.replaceWith(
        start + change.from, start + change.to,
        change.text ? schema.text(change.text) : null)
      this.view.dispatch(tr)
    }
  }
  
  codeMirrorKeymap() {
    let view = this.view
    let mod = /Mac/.test(navigator.platform) ? "Cmd" : "Ctrl"
    return CodeMirror.normalizeKeyMap({
      Up: () => this.maybeEscape("line", -1),
      Left: () => this.maybeEscape("char", -1),
      Down: () => this.maybeEscape("line", 1),
      Right: () => this.maybeEscape("char", 1),
      [`${mod}-Z`]: () => undo(view.state, view.dispatch),
      [`Shift-${mod}-Z`]: () => redo(view.state, view.dispatch),
      [`${mod}-Y`]: () => redo(view.state, view.dispatch),
      "Ctrl-Enter": () => {
        if (exitCode(view.state, view.dispatch)) view.focus()
      }
    })
  }
  
  maybeEscape(unit, dir) {
    let pos = this.cm.getCursor()
    if (this.cm.somethingSelected() ||
        pos.line != (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
        (unit == "char" &&
         pos.ch != (dir < 0 ? 0 : this.cm.getLine(pos.line).length)))
      return CodeMirror.Pass
    this.view.focus()
    let targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize)
    let selection = Selection.near(this.view.state.doc.resolve(targetPos), dir)
    this.view.dispatch(this.view.state.tr.setSelection(selection).scrollIntoView())
    this.view.focus()
  }
  
  update(node) {
    if (node.type != this.node.type) return false
    this.node = node
    let change = computeChange(this.cm.getValue(), node.textContent)
    if (change) {
      this.updating = true
      this.cm.replaceRange(change.text, this.cm.posFromIndex(change.from),
                           this.cm.posFromIndex(change.to))
      this.updating = false
    }
    return true
  }
  
  selectNode() { this.cm.focus() }
  stopEvent() { return true }
}

//==============================
// Create the editor
//==============================

const {EditorState} = require("prosemirror-state")
const {DOMParser} = require("prosemirror-model")
const {EditorView} = require("prosemirror-view")
const {exampleSetup} = require("prosemirror-example-setup")

var startDoc = DOMParser.fromSchema(mySchema).parse(document.querySelector("#content"));

var state = EditorState.create({
    doc: startDoc,
    plugins: exampleSetup({schema: mySchema})
  })

window.view = new EditorView(document.querySelector("#editor"), {
  state: state,
  nodeViews: {
    code_block(node, view, getPos) { 
        return new CodeBlockView(node, view, getPos) 
    }
  }
})
