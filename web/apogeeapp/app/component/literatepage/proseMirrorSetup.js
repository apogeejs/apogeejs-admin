//===========================
//create the schema
//===========================

import { createSchema } from "/apogeeapp/app/editor/apogeeSchema.js";

const schema = createSchema();

//===========================
//create the toolbar
//===========================

const {Plugin} = require("prosemirror-state")

import ApogeeToolbar from "/apogeeapp/app/editor/toolbar/ApogeeToolbar.js";
import BlockToggleItem from "/apogeeapp/app/editor/toolbar/BlockToggleItem.js";
import MarkToggleItem from "/apogeeapp/app/editor/toolbar/MarkToggleItem.js";
import MarkDropdownItem from "/apogeeapp/app/editor/toolbar/MarkDropdownItem.js";

let toolbarItems = [
  new BlockToggleItem(schema.nodes.paragraph, "Normal", "atb_normal_style", "Normal Paragraph Text", schema.nodes.paragraph),
  new BlockToggleItem(schema.nodes.heading1, "H1", "atb_h1_style", "Heading 1", schema.nodes.paragraph),
  new BlockToggleItem(schema.nodes.heading2, "H2", "atb_h2_style", "Heading 2", schema.nodes.paragraph),
  new BlockToggleItem(schema.nodes.heading3, "H3", "atb_h3_style", "Heading 3", schema.nodes.paragraph),
  new BlockToggleItem(schema.nodes.heading4, "H4", "atb_h4_style", "Heading 4", schema.nodes.paragraph),
  new MarkToggleItem(schema.marks.bold, null, "B", "atb_bold_style", "Bold"),
  new MarkToggleItem(schema.marks.italic, null, "I", "atb_italic_style", "Italic"),
  new MarkDropdownItem(schema.marks.fontfamily, "fontfamily", [["Sans-serif",false], ["Serif","Serif"], ["Monospace","Monospace"]]),
  new MarkDropdownItem(schema.marks.fontsize, "fontsize", [["75%",".75em"], ["100%",false], ["150%","1.5em"], ["200%","2em"]]),
  new MarkDropdownItem(schema.marks.textcolor, "color", [["Black",false],["Blue","blue"],["Red","red"],["Green","green"],["Yellow","yellow"],["Dark Gray","#202020"],
    ["Gray","#505050"],["light gray","#808080"]]),
  new MarkDropdownItem(schema.marks.highlight, "color", [["None",false], ["Yellow","yellow"], ["Cyan","cyan"], ["Pink","pink"], ["Green","green"],
    ['Orange',"orange"], ["Red","red"], ["Gray","#a0a0a0"]])
];

let toolbarPlugin = new Plugin({
  view(editorView) {
    let toolbarView = new ApogeeToolbar(toolbarItems, editorView);
    editorView.dom.parentNode.insertBefore(toolbarView.dom, editorView.dom);
    return toolbarView;
  }
})

//===========================
//state debug plugin
//===========================

import StateCheck from "/apogeeapp/app/editor/StateCheck.js";

let stateCheckPlugin = new Plugin({
  view(editorView) {
    let stateCheck = new StateCheck(editorView);
    return stateCheck;
  }
})


//==============================
// Create the editor
//==============================

const { EditorState } = require("prosemirror-state")
const { DOMParser } = require("prosemirror-model")
const { EditorView } = require("prosemirror-view")
const { Step } = require("prosemirror-transform")
const { undo, redo, history } = require("prosemirror-history")
const { keymap } = require("prosemirror-keymap")
const { baseKeymap } = require("prosemirror-commands")

const { insertPoint } = require("prosemirror-transform")
const { Fragment } = require("prosemirror-model")

import ApogeeComponentView from "/apogeeapp/app/editor/ApogeeComponentView.js";

var ProseMirrorNode;
function NodeLoad() {
  const { Node } = require("prosemirror-model");
  ProseMirrorNode = Node;
}
NodeLoad();

function saveState() {
  var stateJson = window.view.state.toJSON();
  console.log(JSON.stringify(stateJson));
}

function openState() {
  var stateText = prompt("Enter the state json:");
  var stateJson = JSON.parse(stateText);
  var doc = ProseMirrorNode.fromJSON(schema, stateJson.doc);
  var state = createEditorState(doc);
  window.view.updateState(state);
}

function showSelection() {
  var selection = window.view.state.selection;
  console.log(JSON.stringify(selection));
}

function createEditorState(doc) {
  var state = EditorState.create({
    doc: doc,
    plugins: [
      history(),
      keymap({ "Mod-z": undo, "Mod-y": redo }),
      keymap(baseKeymap),
      toolbarPlugin,
      stateCheckPlugin
    ]
  });
  return state;
}

//===============================
//set up the export functions
//===============================

var proseMirror = {};

proseMirror.createEditorState = function (docJson) {
  var doc;
  if (docJson) {
    doc = ProseMirrorNode.fromJSON(schema, docJson);
  }
  else {
    doc = DOMParser.fromSchema(schema).parse("");
  }

  var state = createEditorState(doc);

  return state;
}

proseMirror.createEditorView = function (containerElement, folderComponent, folderMember, editorData) {

  var nodeViews = {};
  nodeViews.apogeeComponent = (node, view, getPos) => new ApogeeComponentView(node, view, getPos, folderComponent, folderMember);

  var dispatchTransaction = transaction => folderComponent.applyTransaction(transaction);

  var editorView = new EditorView(containerElement, {
    state: editorData,
    dispatchTransaction: dispatchTransaction,
    nodeViews: nodeViews
  })

  return editorView;

}

proseMirror.getNewEditorData = function (editorData, stepsJson) {
  var transaction = editorData.tr;
  stepsJson.forEach(stepJson => {
    try {
      var step = Step.fromJSON(schema, stepJson);
      transaction.step(step);
    }
    catch (error) {
      console.log("Step failed: " + JSON.stringify(stepJson));
      return null;
    }
  });
  return editorData.apply(transaction);
}

proseMirror.getInsertIsOk = function (literatePageComponent) {
  var state = literatePageComponent.getEditorData();

  return insertPoint(state.doc, state.selection.from, schema.nodes.apogeeComponent) != null
}

proseMirror.insertComponentOnPage = function (literatePageComponent, childName) {
  var state = literatePageComponent.getEditorData();

  let { empty, $from, $to } = state.selection, content = Fragment.empty
  if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
    content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
  let transaction = state.tr.replaceSelectionWith(schema.nodes.apogeeComponent.create({ "state": childName }));

  var commandData = literatePageComponent.createInsertCommand(transaction);
  return commandData;
}


export { proseMirror as default }




