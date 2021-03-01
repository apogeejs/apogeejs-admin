
//=======================
// Create the test block schema
//=======================

const {Schema} = require("prosemirror-model")
const {schema} = require("prosemirror-schema-basic")

const testBlockSpec = {
  group: "block",
  content: "text*",
  marks: "",
  // This makes the view treat the node as a leaf, even though it
  // technically has content
  atom: true,
  toDOM: () => ["div", 0],
  parseDOM: [{tag: "div"}]
}

const testBlockSchema = new Schema({
  nodes: schema.spec.nodes.addBefore("image", "testBlock", testBlockSpec),
  marks: schema.spec.marks
})

//===================
//add test block command
//===================

const {insertPoint} = require("prosemirror-transform")
const {MenuItem} = require("prosemirror-menu")
const {buildMenuItems} = require("prosemirror-example-setup")
const {Fragment} = require("prosemirror-model")

let menu = buildMenuItems(testBlockSchema)
menu.insertMenu.content.push(new MenuItem({
  title: "Insert Test BLock",
  label: "Test Block",
  select(state) {
    return insertPoint(state.doc, state.selection.from, testBlockSchema.nodes.testBlock) != null
  },
  run(state, dispatch) {
    let {empty, $from, $to} = state.selection, content = Fragment.empty
    if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
      content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
    dispatch(state.tr.replaceSelectionWith(testBlockSchema.nodes.testBlock.create(null, content)))
  }
}))


//==============================
// Add a test block view class
//==============================

const {StepMap} = require("prosemirror-transform")
const {keymap} = require("prosemirror-keymap")
const {undo, redo} = require("prosemirror-history")

class TestBlockView {
  constructor(node, view, getPos) {
    // We'll need these later
    this.node = node
    this.view = view
    this.getPos = getPos

    // The node's representation in the editor
    this.dom = document.createElement("div");
    
    this.saveButton = document.createElement("button");
    this.saveButton.innerHTML = "Save";
    this.saveButton.onclick = () => this.save();
    this.dom.appendChild(this.saveButton);
    
    this.cancelButton = document.createElement("button");
    this.cancelButton.innerHTML = "Cancel";
    this.cancelButton.onclick = () => this.cancel();
    this.dom.appendChild(this.cancelButton);
    
    this.dom.appendChild(document.createElement("br"));

    this.textArea = document.createElement("textarea");
    this.dom.appendChild(this.textArea);

    this.contentDiv = document.createElement("div");
    this.dom.appendChild(this.contentDiv);
    
    this.setViewDataFromNode();
    
  }
  
  ///////////////////////////////////////////////////////////////////
  //start my new functions
  
    save() {
        let initialText = this.node.textContent;
        let targetText = this.textArea.value;
        let start = this.getPos() + 1;
        let end = start + initialText.length;
        let textNode = targetText ? testBlockSchema.text(targetText) : null
        
        let tr = this.view.state.tr.replaceWith(start, end, textNode);
        this.view.dispatch(tr);
    }
  
  valueChanged() {
    
  }
  
  cancel() {
      //replace value in text area
      this.textArea.value = this.node.textContent;
  }
  
  
  
  //end my new functions
  ////////////////////////////////////////////////////////////////////
  
  selectNode() {
    this.dom.classList.add("ProseMirror-selectednode")
    //if (!this.innerView) this.open()
  }

  deselectNode() {
    this.dom.classList.remove("ProseMirror-selectednode")
    //if (this.innerView) this.close()
  }  
  
// open() {
//    // Append a tooltip to the outer node
//    let tooltip = this.dom.appendChild(document.createElement("div"))
//    tooltip.className = "footnote-tooltip"
//    // And put a sub-ProseMirror into that
//    this.innerView = new EditorView(tooltip, {
//      // You can use any node as an editor document
//      state: EditorState.create({
//        doc: this.node,
//        plugins: [keymap({
//          "Mod-z": () => undo(this.outerView.state, this.outerView.dispatch),
//          "Mod-y": () => redo(this.outerView.state, this.outerView.dispatch)
//        })]
//      }),
//      // This is the magic part
//      dispatchTransaction: this.dispatchInner.bind(this),
//      handleDOMEvents: {
//        mousedown: () => {
//          // Kludge to prevent issues due to the fact that the whole
//          // footnote is node-selected (and thus DOM-selected) when
//          // the parent editor is focused.
//          if (this.outerView.hasFocus()) this.innerView.focus()
//        }
//      }
//    })
//  }

//  close() {
//    this.innerView.destroy()
//    this.innerView = null
//    this.dom.textContent = ""
//  }
  
//  dispatchInner(tr) {
//    let {state, transactions} = this.innerView.state.applyTransaction(tr)
//    this.innerView.updateState(state)
//
//    if (!tr.getMeta("fromOutside")) {
//      let outerTr = this.outerView.state.tr, offsetMap = StepMap.offset(this.getPos() + 1)
//      for (let i = 0; i < transactions.length; i++) {
//        let steps = transactions[i].steps
//        for (let j = 0; j < steps.length; j++)
//          outerTr.step(steps[j].map(offsetMap))
//      }
//      if (outerTr.docChanged) this.outerView.dispatch(outerTr)
//    }
//  }  

    setViewDataFromNode() {
        this.textArea.value = this.node.textContent;
        this.contentDiv.innerHTML = this.node.textContent;
    }
  
  update(node) {
    if (!node.sameMarkup(this.node)) return false
    this.node = node;
    this.setViewDataFromNode();
    
//    if (this.innerView) {
//      let state = this.innerView.state
//      let start = node.content.findDiffStart(state.doc.content)
//      if (start != null) {
//        let {a: endA, b: endB} = node.content.findDiffEnd(state.doc.content)
//        let overlap = start - Math.min(endA, endB)
//        if (overlap > 0) { endA += overlap; endB += overlap }
//        this.innerView.dispatch(
//          state.tr
//            .replace(start, endB, node.slice(start, endA))
//            .setMeta("fromOutside", true))
//      }
//    }
    return true
  }
  
  destroy() {
//    if (this.innerView) this.close()
  }

  stopEvent(event) {
      return true;
  }

  ignoreMutation() { return true }
}

//==============================
// Create the editor
//==============================

const {EditorState} = require("prosemirror-state")
const {DOMParser} = require("prosemirror-model")
const {EditorView} = require("prosemirror-view")
const {exampleSetup} = require("prosemirror-example-setup")

var startDoc = DOMParser.fromSchema(testBlockSchema).parse(document.querySelector("#content"));

var state = EditorState.create({
    doc: startDoc,
    plugins: exampleSetup({schema: testBlockSchema, menuContent: menu.fullMenu})
  })

window.view = new EditorView(document.querySelector("#editor"), {
  state: state,
  nodeViews: {
    testBlock(node, view, getPos) { 
        return new TestBlockView(node, view, getPos) 
    }
  }
})

function saveState() {
    var stateJson = window.view.state.toJSON();
    console.log(JSON.stringify(stateJson));
}
