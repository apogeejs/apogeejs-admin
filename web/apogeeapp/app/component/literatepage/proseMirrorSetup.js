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

import {setTextBlock,setListBlock,listIndent,listUnindent} from "/apogeeapp/app/editor/toolbar/menuUtils.js";

let paragraphCommand = (state, dispatch)=> setTextBlock(state, schema.nodes.paragraph, dispatch);
let h1Command = (state, dispatch)=> setTextBlock(state, schema.nodes.heading1, dispatch);
let h2Command = (state, dispatch)=> setTextBlock(state, schema.nodes.heading2, dispatch);
let h3Command = (state, dispatch)=> setTextBlock(state, schema.nodes.heading3, dispatch);
let h4Command = (state, dispatch)=> setTextBlock(state, schema.nodes.heading4, dispatch);
let bulletCommand = (state, dispatch)=> setListBlock(state, schema.nodes.bulletList, dispatch);
let numberedCommand = (state, dispatch)=> setListBlock(state, schema.nodes.numberedList, dispatch);
let indentCommand = (state, dispatch) => listIndent(state, dispatch);
let indentActiveFunction = null;
let unindentCommand = (state, dispatch) => listUnindent(state, dispatch);
let unindentActiveFunction = null;

//=====================================================================================================
//start experimental commands
import { setBlockType, lift, wrapIn, joinUp, joinDown  }  from "/prosemirror/lib/prosemirror-commands/src/commands.js";
import { NodeRange } from "/prosemirror/lib/prosemirror-model/src/index.js";

let wrapInWorkerCommand = wrapIn(schema.nodes.workerParent);
let liftFromWorkerCommand = (state,dispatch) => liftFromWorker(state,dispatch);
let liftLeastCommand = (state,dispatch) => lift(state,dispatch);
let wrapInBulletCommand = wrapIn(schema.nodes.bulletList);
let setAsListItemCommand = setBlockType(schema.nodes.listItem);
let setAsParagraphCommand = setBlockType(schema.nodes.paragraph);
let setAsH1Command = setBlockType(schema.nodes.heading1);
let setAsH2Command = setBlockType(schema.nodes.heading2);
let splitNonTextTop = (state,dispatch) => splitParent(true, state, dispatch);
let splitNonTextBottom = (state,dispatch) => splitParent(false, state, dispatch);
let joinUpCommand = (state,dispatch) => joinUp(state, dispatch);
let joinDownCommand = (state,dispatch) => joinDown(state, dispatch);


//rewrite of list to always lift around the range at tdepth 1 - which should be the workerParent
function liftFromWorker(state, dispatch) {
  let {$from, $to} = state.selection;
  let depth = 1;
  let target = 0;
  let range = new NodeRange($from,$to,depth);
  if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView())
  return true
}

//This will split any parent nodes not inlcuding the document, assuming the selection is in a text block
function splitParent(fromTop, state, dispatch) {
  let $pos = fromTop ? state.selection.$from : state.selection.$to;
  //here the parent variable represents the text block. We will split the ancestors above that (not including the doc)
  let parent = $pos.parent;
  if(parent.isTextblock) {
    let parentDepth = $pos.depth;
    let grandparentDepth = parentDepth-1;
    let grandparentPos = fromTop ? $pos.start(parentDepth) - 1 : $pos.end(parentDepth) + 1;
    if(grandparentDepth > 0) {
      if(dispatch)  dispatch(state.tr.split(grandparentPos,grandparentDepth).scrollIntoView());
      return true;
    }
  }
  //fi we get here we did not split anything
  return false;
}

///////////////////////////////////////////////////////////////////////

import { findWrapping } from "/prosemirror/lib/prosemirror-transform/src/index.js";

let convertToParagraphCommand = (state,dispatch) => convertToNonListBlockType(schema.nodes.paragraph, state, dispatch);

function convertToNonListBlockType(nodeType,state,dispatch) {
  //this will be our transform
  let transform = state.tr;

  //this is our range to convert
  let {$from, $to} = state.selection;

  //-----------------------------------
  //split any parens at start if needed
  //-----------------------------------
  let startCutDone = false;
  {
    let modPath = pathToModPath($from.path);
    console.log("From Path: " + JSON.stringify(modPath));

    //traverse backwards to look for the last non-0 index list (last element is doc, we can ignore it)
    for(let i = modPath.length-1; i > 0; i--) {
      let entry = modPath[i];
      if(((entry.nodeType == "bulletList")||(entry.nodeType == "bulletList"))&&(entry.index > 0)) {
        //split here!
        //cut at start of text block
        let textBlockDepth = $from.depth; //I should probably validate the last element is a text block
        let cutDepth = i;
        let cutPosition = $from.start(textBlockDepth) - 1;
        transform = transform.split(cutPosition,cutDepth);
        startCutDone = true; //I should make sure this succeeds, I think
        break;
      }
    }
  }

//######################################################
//PROBLEM - I am mapping in each step using the transformation
//I should be mapping using the step (or always map from the initial from,to)
//also I need to verify the steps don't do something funny to my location - like put it somewhere else
//for example, adding text can move the position (and I can specify which way to move it, right or left of the next text)
//######################################################

  //update the selection if we changed the doc
  if(startCutDone) {
    let newFrom = transform.mapping.map($from.pos);
    let newTo = transform.mapping.map($to.pos);
    $from = transform.doc.resolve(newFrom);
    $to = transform.doc.resolve(newTo);
  }

  //---------------------------
  //split at the end if needed
  //---------------------------
  let endCutDone = false;
  {
    let modPath = pathToModPath($to.path);
    console.log("To Path: " + JSON.stringify(modPath));

    //traverse backwards to look for the last non-0 index list (last element is doc, we can ignore it)
    for(let i = modPath.length-1; i > 0; i--) {
      let entry = modPath[i];
      if(((entry.nodeType == "bulletList")||(entry.nodeType == "numberedList"))&&(entry.index > 0)) {
        //split here!
        //cut at start of text block
        let textBlockDepth = $to.depth; //I should probably validate the last element is a text block
        let cutDepth = i;
        let cutPosition = $to.end(textBlockDepth) + 1;
        transform = transform.split(cutPosition,cutDepth);
        endCutDone = true;
        break;
      }
    }
  }

  //update the selection if we changed the doc
  if(endCutDone) {
    let newFrom = transform.mapping.map($from.pos);
    let newTo = transform.mapping.map($to.pos);
    $from = transform.doc.resolve(newFrom);
    $to = transform.doc.resolve(newTo);
  }

  //------------------------------
  // Add the worker parent
  //------------------------------

  {
    //depth is set to 0
    let depth = 0;
    let range = new NodeRange($from,$to,depth), wrapping = range && findWrapping(range, schema.nodes.workerParent);
    if (!wrapping) throw new Error("Wrapping not found!"); //need to work out error handling
    transform = transform.wrap(range, wrapping)

    let newFrom = transform.mapping.map($from.pos);
    let newTo = transform.mapping.map($to.pos);
    $from = transform.doc.resolve(newFrom);
    $to = transform.doc.resolve(newTo);
  }

  //-------------------------------
  // lift out of any lists!
  //-------------------------------

  {
    //grab the worker node
    let workerNode = $from.path[3]; //verify this!
    let workerPosition = $from.path[5];

    //cycle through its direct children
    let listInfo;
    let findChildList = (node, offset, index) => {
      //exit is we already found a list
      if(listInfo.contentSize !== undefined) return;

      if((node.type == schema.nodes.bulletList)||(node.type == schema.nodes.numberedList)) {
        //list found
        //look for a list inside thisone
        node.forEach(findChildList);
        if(listInfo.contentSize !== undefined) {
          //update the list info 
          listInfo.offset += offset + 1;
          listInfo.listGenerations += 1;
        }
        else {
          //set list info for this list
          listInfo.listGenerations = 1;
          listInfo.offset = offset;
          listInfo.contentSize = node.content.size;
        }
      }
    }

    //this will lift the list
    let processListResult = () => {
      if(listInfo.contentSize === undefined) return;

      let listContentsFrom = workerPosition + listInfo.offset + 1 + 2; //why +2?
      let listContentsTo = listContentsFrom + listInfo.contentSize - 3; //why -3? 
      let listDepth = listInfo.listGenerations + 1;
      let listChildrenDepth = listDepth+1;
      let $listContentsFrom = transform.doc.resolve(listContentsFrom);
      let $listContentsTo = transform.doc.resolve(listContentsTo);
      let range = new NodeRange($listContentsFrom,$listContentsTo,listChildrenDepth-1); //why -1?
      
      //lift the children out of the list
      transform = transform.lift(range, listDepth-1);  //why -1?

      //udpate the working range variables
      let newFrom = transform.mapping.map($from.pos);
      let newTo = transform.mapping.map($to.pos);
      $from = transform.doc.resolve(newFrom);
      $to = transform.doc.resolve(newTo);
      workerPosition = $from.path[5];
      workerNode = $from.path[3];

      //clear the list info for the next iterateion
      listInfo = {};
      doSearch = true;
    }

    //we will list one list per iteration, and keep doing this until there are no more lists
    let doSearch = true;
    for(listInfo = {}; doSearch; processListResult()) {
      doSearch = false;
      workerNode.forEach(findChildList);
    } 
  }

  //-------------------------------
  // convert the text blocks to the specified type
  // (there should only be text blocks)
  //-------------------------------

  {
    //grab the worker node
    let workerNode = $from.path[3]; //verify this!
    let workerPosition = $from.path[5];

    let workerContentStart = workerPosition+1;
    let workerContentEnd = workerContentStart + workerNode.content.size;

    transform = transform.setBlockType(workerContentStart, workerContentEnd, nodeType);

    //udpate the working range variables
    let newFrom = transform.mapping.map($from.pos);
    let newTo = transform.mapping.map($to.pos);
    $from = transform.doc.resolve(newFrom);
    $to = transform.doc.resolve(newTo);
  }

  //------------------------------
  // lift out of the worker
  //------------------------------

  {
    //grab the worker node
    let workerNode = $from.path[3]; //verify this!
    let workerPosition = $from.path[5];
    let workerDepth = 1;

    let workerContentStart = workerPosition+1;
    let workerContentEnd = workerContentStart + workerNode.content.size;
    let $workerContentStart = transform.doc.resolve(workerContentStart);
    let $workerContentEnd = transform.doc.resolve(workerContentEnd);
    let range = new NodeRange($workerContentStart,$workerContentEnd,workerDepth); //why worker depth?
      
    //lift the children out of the list
    transform = transform.lift(range, workerDepth-1);  //why -1?

    //udpate the working range variables
    let newFrom = transform.mapping.map($from.pos);
    let newTo = transform.mapping.map($to.pos);
    $from = transform.doc.resolve(newFrom);
    $to = transform.doc.resolve(newTo);
  }

  //------------------------------
  // execute the transform
  //------------------------------

  if((dispatch)&&(transform.docChanged)) {
    dispatch(transform);
  }
  
}

function pathToModPath(path) {
  let modPath = [];
  for(let i = 0; i < path.length-2; i+= 3) {
    let entry = {};
    entry.nodeType = path[i].type.name;
    entry.index = path[i+1];
    entry.startPos = path[i+2];
    modPath.push(entry);
  }
  return modPath;
}


//end experimental commands
//=================================================================

let toolbarItems = [
  new ActionButton(convertToParagraphCommand,null,"Convert to Paragraph","atb_bold_style","temp"),
  //new BlockRadioItem(schema.nodes.paragraph, paragraphCommand, "Normal", "atb_normal_style", "Normal Paragraph Text"),
  //new BlockRadioItem(schema.nodes.heading1, h1Command, "H1", "atb_h1_style", "Heading 1"),
  //new BlockRadioItem(schema.nodes.heading2, h2Command, "H2", "atb_h2_style", "Heading 2"),
  //new BlockRadioItem(schema.nodes.heading3, h3Command, "H3", "atb_h3_style", "Heading 3"),
  //new BlockRadioItem(schema.nodes.heading4, h4Command, "H4", "atb_h4_style", "Heading 4"),
  //new BlockRadioItem(schema.nodes.bulletList, bulletCommand, "Bullet", "atb_ul_style", "Bullet List"),
  //new BlockRadioItem(schema.nodes.numberedList, numberedCommand, "Numbered", "atb_ol_style", "Numbered List"),
  //new ActionButton(indentCommand, indentActiveFunction, "L+", "atb_lindent_style", "Indent List"),
  //new ActionButton(unindentCommand, unindentActiveFunction, "L-", "atb_lunindent_style", "Unindent List"),
  //new MarkToggleItem(schema.marks.bold, null, "B", "atb_bold_style", "Bold"),
  //new MarkToggleItem(schema.marks.italic, null, "I", "atb_italic_style", "Italic"),
  //new MarkDropdownItem(schema.marks.fontfamily, "fontfamily", [["Sans-serif",false], ["Serif","Serif"], ["Monospace","Monospace"]]),
  //new MarkDropdownItem(schema.marks.fontsize, "fontsize", [["75%",".75em"], ["100%",false], ["150%","1.5em"], ["200%","2em"]]),
  //new MarkDropdownItem(schema.marks.textcolor, "color", [["Black",false],["Blue","blue"],["Red","red"],["Green","green"],["Yellow","yellow"],["Dark Gray","#202020"],
  //  ["Gray","#505050"],["light gray","#808080"]]),
  //new MarkDropdownItem(schema.marks.highlight, "color", [["None",false], ["Yellow","yellow"], ["Cyan","cyan"], ["Pink","pink"], ["Green","green"],
  //  ['Orange',"orange"], ["Red","red"], ["Gray","#a0a0a0"]]),
  new ActionButton(wrapInWorkerCommand,null,"Wrap In Worker","atb_italic_style","temp"),
  new ActionButton(liftFromWorkerCommand,null,"Lift from Worker","atb_italic_style","temp"),
  new ActionButton(liftLeastCommand,null,"Lift least","atb_italic_style","temp"),
  new ActionButton(splitNonTextTop,null,"split top","atb_italic_style","temp"),
  new ActionButton(splitNonTextBottom,null,"split bottom","atb_italic_style","temp"),
  new ActionButton(joinUpCommand,null,"join up","atb_italic_style","temp"),
  new ActionButton(joinDownCommand,null,"join down","atb_italic_style","temp"),
  new ActionButton(wrapInBulletCommand,null,"Wrap In Bullet","atb_italic_style","temp"),
  new ActionButton(setAsListItemCommand,null,"set as List Item","atb_italic_style","temp"),
  new ActionButton(setAsParagraphCommand,null,"set as Para","atb_italic_style","temp"),
  new ActionButton(setAsH1Command,null,"set as H1","atb_italic_style","temp"),
  new ActionButton(setAsH2Command,null,"set as H2","atb_italic_style","temp"),
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




