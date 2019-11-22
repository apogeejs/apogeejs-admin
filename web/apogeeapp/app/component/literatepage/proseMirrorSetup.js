//===========================
//create the schema
//===========================

import { createFolderSchema } from "/apogeeapp/app/editor/apogeeSchema.js";


import ApogeeToolbar from "/apogeeapp/app/editor/toolbar/ApogeeToolbar.js";
//import BlockRadioItem from "/apogeeapp/app/editor/toolbar/BlockRadioItem.js";
import MarkToggleItem from "/apogeeapp/app/editor/toolbar/MarkToggleItem.js";
import MarkDropdownItem from "/apogeeapp/app/editor/toolbar/MarkDropdownItem.js";
import ActionButton from "/apogeeapp/app/editor/toolbar/ActionButton.js";


import StateCheck from "/apogeeapp/app/editor/StateCheck.js";

import { baseKeymap } from "/apogeeapp/app/editor/apogeeCommands.js";

import {Plugin}  from "/prosemirror/lib/prosemirror-state/src/index.js";
import { EditorState, Selection,  }  from "/prosemirror/lib/prosemirror-state/src/index.js";
import { DOMParser, Node as ProseMirrorNode, Mark }  from "/prosemirror/lib/prosemirror-model/src/index.js";
import { EditorView }  from "/prosemirror/lib/prosemirror-view/src/index.js";
import { Step }  from "/prosemirror/lib/prosemirror-transform/src/index.js";
import { keymap }  from "/prosemirror/lib/prosemirror-keymap/src/keymap.js";

import ApogeeComponentView from "/apogeeapp/app/editor/ApogeeComponentView.js";
import { undo, redo }  from "/apogeeapp/app/editor/apogeeHistory.js";


import {convertToNonListBlockType, convertToListBlockType, indentSelection, unindentSelection } from "/apogeeapp/app/editor/apogeeCommands.js";

export function createProseMirrorManager (folderComponent) {

  //this is the function return object - the editor manager
  let proseMirror = {};

  const schema = createFolderSchema(folderComponent);

  //===========================
  //create the toolbar
  //===========================
  let convertToParagraphCommand = (state,dispatch) => convertToNonListBlockType(schema.nodes.paragraph, state, dispatch);
  let convertToH1Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading1, state, dispatch);
  let convertToH2Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading2, state, dispatch);
  let convertToH3Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading3, state, dispatch);
  let convertToH4Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading4, state, dispatch);
  let convertToBulletCommand = (state,dispatch) => convertToListBlockType(schema.nodes.bulletList, state, dispatch);
  let convertToNumberedCommand = (state,dispatch) => convertToListBlockType(schema.nodes.numberedList, state, dispatch);
  let indentCommand = (state,dispatch) => indentSelection(state, dispatch);
  let unindentCommand = (state,dispatch) => unindentSelection(state, dispatch);

  //this function determines if the block button is highlighted
  let getBlockIsHighlightedFunction = (nodeType) => {
    return (selectionInfo) => {
      let blockTypes = selectionInfo.blocks.blockTypes;
      return ((blockTypes.length === 1)&&(blockTypes[0] == nodeType));
    }
  }

  //this determines if the list indent buttons are active
  let listIndentIsActive = (selectionInfo) => {
    let blockCount = selectionInfo.blocks.blockCount;
    let blockTypes = selectionInfo.blocks.blockTypes;
    return ((blockCount === 1)&&(blockTypes[0].spec.group == "list"));
  }

  let toolbarItems = [
    new ActionButton(convertToParagraphCommand,getBlockIsHighlightedFunction(schema.nodes.paragraph),null,"Normal","atb_normal_style","Paragraph"),
    new ActionButton(convertToH1Command,getBlockIsHighlightedFunction(schema.nodes.heading1),null,"H1","atb_h1_style","Heading 1"),
    new ActionButton(convertToH2Command,getBlockIsHighlightedFunction(schema.nodes.heading2),null,"H2","atb_h2_style","Heading 2"),
    new ActionButton(convertToH3Command,getBlockIsHighlightedFunction(schema.nodes.heading3),null,"H3","atb_h3_style","Heading 3"),
    new ActionButton(convertToH4Command,getBlockIsHighlightedFunction(schema.nodes.heading4),null,"H4","atb_h4_style","Heading 4"),
    new ActionButton(convertToBulletCommand,getBlockIsHighlightedFunction(schema.nodes.bulletList),null,"Bullet","atb_ul_style","Bullet List"),
    new ActionButton(convertToNumberedCommand,getBlockIsHighlightedFunction(schema.nodes.numberedList),null,"Numbered","atb_ol_style","Nubmered List"),
    new ActionButton(indentCommand, null, listIndentIsActive, "L+", "atb_lindent_style", "Indent List"),
    new ActionButton(unindentCommand, null, listIndentIsActive, "L-", "atb_lunindent_style", "Unindent List"),
    new MarkToggleItem(schema.marks.bold, null, "B", "atb_bold_style", "Bold"),
    new MarkToggleItem(schema.marks.italic, null, "I", "atb_italic_style", "Italic"),
    new MarkDropdownItem(schema.marks.fontfamily, "fontfamily", [["Sans-serif",false], ["Serif","Serif"], ["Monospace","Monospace"]]),
    new MarkDropdownItem(schema.marks.fontsize, "fontsize", [["75%",".75em"], ["100%",false], ["150%","1.5em"], ["200%","2em"]]),
    new MarkDropdownItem(schema.marks.textcolor, "color", [["Black",false],["Blue","blue"],["Red","red"],["Green","green"],["Yellow","yellow"],["Dark Gray","#202020"],
      ["Gray","#505050"],["light gray","#808080"]]),
    new MarkDropdownItem(schema.marks.highlight, "color", [["None",false], ["Yellow","yellow"], ["Cyan","cyan"], ["Pink","pink"], ["Green","green"],
      ['Orange',"orange"], ["Red","red"], ["Gray","#a0a0a0"]]),

  ];

  //create the toolbar instance
  let toolbarView = new ApogeeToolbar(toolbarItems);
  proseMirror.editorToolbarElement = toolbarView.dom;

  //create the toolbar plugin - we will reuse the toolbar element here
  let toolbarPlugin = new Plugin({
    view(editorView) {
      toolbarView.setEditorView(editorView);
      return toolbarView;
    }
  })


  //===========================
  //state debug plugin
  //===========================

  let stateCheckPlugin = new Plugin({
    view(editorView) {
      let stateCheck = new StateCheck(editorView);
      return stateCheck;
    }
  })

  //==============================
  // Create the editor
  //==============================

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

  proseMirror.getNewEditorData = function (editorData, commandData) {

    let schema = editorData.schema;

    //apply the editor transaction
    var transaction = editorData.tr;

    //set the state
    let startSelection = Selection.fromJSON(transaction.doc,commandData.startSelection);
    let startMarks = commandData.startMarks.map(markJson => Marks.fromJson(schema,markJson));
    transaction.setSelection(startSelection);
    transaction.setStoredMarks(startMarks);

    //apply the steps
    commandData.steps.forEach(stepJson => {
      try {
        var step = Step.fromJSON(schema, stepJson);
        transaction = transaction.step(step);
      }
      catch (error) {
        console.log("Step failed: " + JSON.stringify(stepJson));
        return null;
      }
    });

    let endSelection = Selection.fromJSON(transaction.doc,commandData.endSelection);
    let endMarks = commandData.endMarks.map(markJson => Marks.fromJson(schema,markJson));
    transaction.setSelection(endSelection);
    transaction.setStoredMarks(endMarks);

    return editorData.apply(transaction);
  }

  proseMirror.getComponentRange = function(editorData,componentShortName) {
    let doc = editorData.doc;
    let schema = editorData.schema;
    let result = {};
    doc.forEach( (node,offset) => {
      if(node.type == schema.nodes.apogeeComponent) {
        if(node.attrs.name == componentShortName) {
    
          if(result.found) {
            //this shouldn't happen
            throw new Error("Multiple nodes found with the given name");
          }

          result.found = true;
          result.from = offset;
          result.to = result.from + node.nodeSize;
        }
      }
    });
    return result;
  }

  return proseMirror;

}

