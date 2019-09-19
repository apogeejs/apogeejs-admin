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
//import BlockRadioItem from "/apogeeapp/app/editor/toolbar/BlockRadioItem.js";
import MarkToggleItem from "/apogeeapp/app/editor/toolbar/MarkToggleItem.js";
import MarkDropdownItem from "/apogeeapp/app/editor/toolbar/MarkDropdownItem.js";
import ActionButton from "/apogeeapp/app/editor/toolbar/ActionButton.js";


import {convertToNonListBlockType, convertToListBlockType } from "/apogeeapp/app/editor/apogeeCommands.js";

let convertToParagraphCommand = (state,dispatch) => convertToNonListBlockType(schema.nodes.paragraph, state, dispatch);
let convertToH1Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading1, state, dispatch);
let convertToH2Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading2, state, dispatch);
let convertToH3Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading3, state, dispatch);
let convertToH4Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading4, state, dispatch);
let convertToBulletCommand = (state,dispatch) => convertToListBlockType(schema.nodes.bulletList, state, dispatch);
let convertToNumberedCommand = (state,dispatch) => convertToListBlockType(schema.nodes.numberedList, state, dispatch);


let toolbarItems = [
  new ActionButton(convertToParagraphCommand,null,"Normal","atb_normal_style","temp"),
  new ActionButton(convertToH1Command,null,"H1","atb_h1_style","temp"),
  new ActionButton(convertToH2Command,null,"H2","atb_h2_style","temp"),
  new ActionButton(convertToH3Command,null,"H3","atb_h3_style","temp"),
  new ActionButton(convertToH4Command,null,"H4","atb_h4_style","temp"),
  new ActionButton(convertToBulletCommand,null,"Bullet","atb_ul_style","temp"),
  new ActionButton(convertToNumberedCommand,null,"Numbered","atb_ol_style","temp"),
  //new ActionButton(indentCommand, indentActiveFunction, "L+", "atb_lindent_style", "Indent List"),
  //new ActionButton(unindentCommand, unindentActiveFunction, "L-", "atb_lunindent_style", "Unindent List"),
  new MarkToggleItem(schema.marks.bold, null, "B", "atb_bold_style", "Bold"),
  new MarkToggleItem(schema.marks.italic, null, "I", "atb_italic_style", "Italic"),
  new MarkDropdownItem(schema.marks.fontfamily, "fontfamily", [["Sans-serif",false], ["Serif","Serif"], ["Monospace","Monospace"]]),
  new MarkDropdownItem(schema.marks.fontsize, "fontsize", [["75%",".75em"], ["100%",false], ["150%","1.5em"], ["200%","2em"]]),
  new MarkDropdownItem(schema.marks.textcolor, "color", [["Black",false],["Blue","blue"],["Red","red"],["Green","green"],["Yellow","yellow"],["Dark Gray","#202020"],
    ["Gray","#505050"],["light gray","#808080"]]),
  new MarkDropdownItem(schema.marks.highlight, "color", [["None",false], ["Yellow","yellow"], ["Cyan","cyan"], ["Pink","pink"], ["Green","green"],
    ['Orange',"orange"], ["Red","red"], ["Gray","#a0a0a0"]]),

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

import { baseKeymap } from "/apogeeapp/app/editor/apogeeCommands.js";

import { EditorState }  from "/prosemirror/lib/prosemirror-state/src/index.js";
import { DOMParser, Fragment, Node as ProseMirrorNode }  from "/prosemirror/lib/prosemirror-model/src/index.js";
import { EditorView }  from "/prosemirror/lib/prosemirror-view/src/index.js";
import { Step, insertPoint }  from "/prosemirror/lib/prosemirror-transform/src/index.js";
//import { undo, redo, history }  from "/prosemirror/lib/prosemirror-history/src/history.js";
import { keymap }  from "/prosemirror/lib/prosemirror-keymap/src/keymap.js";

import ApogeeComponentView from "/apogeeapp/app/editor/ApogeeComponentView.js";
import { undo, redo }  from "/apogeeapp/app/editor/apogeeHistory.js";

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
      //history(), //this is the prose mirror history plugin
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

//test///////////////////////////////////
function getDeletedApogeeNodes(editorData, stepsJson) {
  //prepare to get apogee nodes
  let apogeeNodes = [];
  let getApogeeNodes = node => {
    if(node.type.name == "apogeeComponent") {
      apogeeNodes.push(node);
    }
    //do not go inside any top level nodes
    return false;
  }

  //get all the replcaed apogee nodes
  stepsJson.forEach( stepJson => {
    if(stepJson.stepType == "replace") {
      editorData.doc.nodesBetween(stepJson.from,stepJson.to,getApogeeNodes);
    }
    else if(stepJson.stepType == "replaceAround") {
      editorData.doc.nodesBetween(stepJson.from,stepJson.gapFrom,getApogeeNodes);
      editorData.doc.nodesBetween(stepJson.gapTo,stepJson.to,getApogeeNodes);
    }
  });

  return apogeeNodes;

}
/////////////////////////////////////////

proseMirror.getNewEditorData = function (editorData, stepsJson) {
  //see if we need to delete any apogee nodes
  var deletedApogeeNodes = getDeletedApogeeNodes(editorData,stepsJson);

  if(deletedApogeeNodes.length > 0) {
    let doDelete = confirm("The selection includes Apogee nodes. Are you sure you want to delete them?");
    //Tdo not do delete.
    //if(!doDelete) return null;
    if(!doDelete) alert("sorry - they will be deleted anyway, until the code is fixed.")
  }

  //delete the apogee nodes
  //(add this)

  //apply the editor transaction
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




