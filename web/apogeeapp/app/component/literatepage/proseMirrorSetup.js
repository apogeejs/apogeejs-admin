//===========================
//create the schema
//===========================

import { createSchema } from "/apogeeapp/app/editor/apogeeSchema.js";

const schema = createSchema();

//===========================
//create the toolbar
//===========================

import {Plugin}  from "/prosemirror/lib/prosemirror-state/src/index.js";

import ApogeeToolbar from "/apogeeapp/app/editor/toolbar/ApogeeToolbar.js";
import BlockRadioItem from "/apogeeapp/app/editor/toolbar/BlockRadioItem.js";
import MarkToggleItem from "/apogeeapp/app/editor/toolbar/MarkToggleItem.js";
import MarkDropdownItem from "/apogeeapp/app/editor/toolbar/MarkDropdownItem.js";
import ActionButton from "/apogeeapp/app/editor/toolbar/ActionButton.js";

let paragraphCommand = (doc, ranges, dispatch)=> setTextBlock(doc, ranges, schema.nodes.paragraph, dispatch);
let h1Command = (doc, ranges, dispatch)=> setTextBlock(doc, ranges, schema.nodes.heading1, dispatch);
let h2Command = (doc, ranges, dispatch)=> setTextBlock(doc, ranges, schema.nodes.heading2, dispatch);
let h3Command = (doc, ranges, dispatch)=> setTextBlock(doc, ranges, schema.nodes.heading3, dispatch);
let h4Command = (doc, ranges, dispatch)=> setTextBlock(doc, ranges, schema.nodes.heading4, dispatch);
let bulletCommand = (doc, ranges, dispatch)=> setListBlock(doc, ranges, schema.nodes.bulletList, dispatch);
let numberedCommand = (doc, ranges, dispatch)=> setListBlock(doc, ranges, schema.nodes.numberedList, dispatch);
let indentCommand = (doc, ranges, dispatch) => listIndent(doc, ranges, dispatch);
let indentActiveFunction = null;
let unindentCommand = (doc, ranges, dispatch) => listUnindent(doc, ranges, dispatch);
let unindentActiveFunction = null;

let toolbarItems = [
  new BlockRadioItem(schema.nodes.paragraph, paragraphCommand, "Normal", "atb_normal_style", "Normal Paragraph Text"),
  new BlockRadioItem(schema.nodes.heading1, h1Command, "H1", "atb_h1_style", "Heading 1"),
  new BlockRadioItem(schema.nodes.heading2, h2Command, "H2", "atb_h2_style", "Heading 2"),
  new BlockRadioItem(schema.nodes.heading3, h3Command, "H3", "atb_h3_style", "Heading 3"),
  new BlockRadioItem(schema.nodes.heading4, h4Command, "H4", "atb_h4_style", "Heading 4"),
  new BlockRadioItem(schema.nodes.bulletList, bulletCommand, "Bullet", "atb_ul_style", "Bullet List"),
  new BlockRadioItem(schema.nodes.numberedList, numberedCommand, "Numbered", "atb_ol_style", "Numbered List"),
  new ActionButton(indentCommand, indentActiveFunction, "L+", "atb_lindent_style", "Indent List"),
  new ActionButton(unindentCommand, unindentActiveFunction, "L-", "atb_lunindent_style", "Unindent List"),
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

import { EditorState }  from "/prosemirror/lib/prosemirror-state/src/index.js";
import { DOMParser, Fragment, Node as ProseMirrorNode }  from "/prosemirror/lib/prosemirror-model/src/index.js";
import { EditorView }  from "/prosemirror/lib/prosemirror-view/src/index.js";
import { Step, insertPoint }  from "/prosemirror/lib/prosemirror-transform/src/index.js";
import { undo, redo, history }  from "/prosemirror/lib/prosemirror-history/src/history.js";
import { keymap }  from "/prosemirror/lib/prosemirror-keymap/src/keymap.js";
import { baseKeymap }  from "/prosemirror/lib/prosemirror-commands/src/commands.js";

import ApogeeComponentView from "/apogeeapp/app/editor/ApogeeComponentView.js";

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




