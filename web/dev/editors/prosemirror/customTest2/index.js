
//=======================
// Create the test block schema
//=======================

const {Schema} = require("prosemirror-model")
const {schema} = require("prosemirror-schema-basic")


//EXPERIMENT!!!
const jsonSpec = {
  group: "json",
  marks: ""
}

const testBlockSpec = {
  group: "block",
  //content: "text*",
  content: "json*",
  marks: "",
  // This makes the view treat the node as a leaf, even though it
  // technically has content
  atom: true,
  toDOM: () => ["div", 0],
  parseDOM: [{tag: "div"}]
}

 const testBlockSchema = new Schema({
   nodes: schema.spec.nodes.addBefore("image", "json", jsonSpec).addBefore("image", "testBlock", testBlockSpec),
   marks: schema.spec.marks
 })

//const testBlockSchema = new Schema({
//  nodes: schema.spec.nodes.addBefore("image", "testBlock", testBlockSpec),
//  marks: schema.spec.marks
//})

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
        //text node version
//        let initialText = this.node.textContent;
//        let targetText = this.textArea.value;
//        let start = this.getPos() + 1;
//        let end = start + initialText.length;
//        let textNode = targetText ? testBlockSchema.text(targetText) : null
//        
//        let tr = this.view.state.tr.replaceWith(start, end, textNode);
//        this.view.dispatch(tr);

        //json node version
        let targetText = this.textArea.value;
        let targetData;
        try {
          targetData = JSON.parse(targetText);
        }
        catch(error) {
          alert("Error parsing JSON input!");
          return;
        }
        let start = this.getPos() + 1;
        let end = this.getPos() + this.node.nodeSize - 1;
        let jsonNode = createJsonNode(targetData);
        
        let tr = this.view.state.tr.replaceWith(start, end, jsonNode);
        this.view.dispatch(tr);
    }

  
  cancel() {
      //replace value in text area
      this.textArea.value = this.node.textContent;
      var textData = this.getTextData();
      this.contentDiv.innerHTML = textData;
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

    setViewDataFromNode() {  
        var textData = this.getTextData();
        this.textArea.value = textData
        this.contentDiv.innerHTML = textData;
    }
    
    getJsonData() {
        var content = this.node.content.content[0];
        var data;
        if(content) data = content.json;
        else data = null;
        return data;
    }
    
    getTextData() {
        var data = this.getJsonData();
        var textData;
        if(data == null) textData = "";
        else textData = JSON.stringify(data);
        return textData;
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
// JSON NODE EXPERIMENT
//==============================

var NodeXXX;
var initNode = () => {
    const {Node} = require("prosemirror-model")
    NodeXXX = Node;
};
initNode();

class JsonNode extends NodeXXX {
  constructor(type, attrs, content, marks) {
    super(type, attrs, null, marks)

    this.json = content
    this.size = 1;
  }

  toString() {
    return JSON.stringify(this.json);
  }

  get textContent() { 
      return JSON.stringify(this.json) 
  }

  textBetween(from, to) { 
      console.log("JsonNode.textBetween not properly implemented!");
      return JSON.stringify(this.json);
      //return this.text.slice(from, to) 
  }

  get nodeSize() { return this.size }

  mark(marks) {
    console.log("JsonNode.marks not properly implemented!");  
    return this;
    //return marks == this.marks ? this : new TextNode(this.type, this.attrs, this.text, marks)
  }

  withText(text) {
      console.log("JsonNode.withText not properly implemented!");
    var text = JSON.stringify(this.json);
    return new TextNode(this.type, this.attrs, text, this.marks)
  }

  cut(from = 0, to = this.nodeSize) {
      console.log("JsonNode.cut not properly implemented!");
    //if (from == 0 && to == this.text.length) return this
    var text = JSON.stringify(this.json);
    return this.withText(text);
    //return this.withText(this.text.slice(from, to))
  }

  eq(other) {
      console.log("JsonNode.eq not properly implemented!");
      //do a better compare
    return (other.type == this.type)&&(other.json == this.json)
  }

  toJSON() {
    let base = super.toJSON()
    base.json = this.json
    return base
  }
}


//class JsonNode extends NodeXXX {
//  constructor(type, attrs, content, marks) {
//    super(type, attrs, null, marks)
//
//    if (!content) throw new RangeError("Empty text nodes are not allowed")
//
//    this.text = content
//  }
//
//  toString() {
//    if (this.type.spec.toDebugString) return this.type.spec.toDebugString(this)
//    return wrapMarks(this.marks, JSON.stringify(this.text))
//  }
//
//  get textContent() { return this.text }
//
//  textBetween(from, to) { return this.text.slice(from, to) }
//
//  get nodeSize() { return this.text.length }
//
//  mark(marks) {
//    return marks == this.marks ? this : new TextNode(this.type, this.attrs, this.text, marks)
//  }
//
//  withText(text) {
//    if (text == this.text) return this
//    return new TextNode(this.type, this.attrs, text, this.marks)
//  }
//
//  cut(from = 0, to = this.text.length) {
//    if (from == 0 && to == this.text.length) return this
//    return this.withText(this.text.slice(from, to))
//  }
//
//  eq(other) {
//    return this.sameMarkup(other) && this.text == other.text
//  }
//
//  toJSON() {
//    let base = super.toJSON()
//    base.text = this.text
//    return base
//  }
//}

function createJsonNode(jsonData) {
    let type = testBlockSchema.nodes.json;
    return new JsonNode(type, type.defaultAttrs, jsonData, null);
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

function showSelection() {
    var selection = window.view.state.selection;
    console.log(JSON.stringify(selection));
}



