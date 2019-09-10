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

//PROBLEMS
// FROM LIST
// - don't add tab at the start of lines from child lists
// TO LIST
// - don't merge at start and end
// - don't convert included lists to be the specified type
// - don't handle tabs at the start of non-list items, beign converted to child lists

import { findWrapping } from "/prosemirror/lib/prosemirror-transform/src/index.js";

let convertToParagraphCommand = (state,dispatch) => convertToNonListBlockType(schema.nodes.paragraph, state, dispatch);
let convertToH1Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading1, state, dispatch);
let convertToH2Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading2, state, dispatch);
let convertToH3Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading3, state, dispatch);
let convertToH4Command = (state,dispatch) => convertToNonListBlockType(schema.nodes.heading4, state, dispatch);
let convertToBulletCommand = (state,dispatch) => convertToListBlockType(schema.nodes.bulletList, state, dispatch);
let convertToNumberedCommand = (state,dispatch) => convertToListBlockType(schema.nodes.numberedList, state, dispatch);

function convertToNonListBlockType(nodeType,state,dispatch) {
  //this will be our transform
  let transform = state.tr;

  //this is our range to convert
  let {$from, $to} = state.selection;

  //---------------------------
  //Split any lists so there is not a list that spans outside the current selection
  //Do after first so this doesn't change the value of $from yet.
  //---------------------------
  transform = splitSpannedListAfterPos($to,transform);
  transform = splitSpannedListBeforePos($from,transform);

  //update if we did any transform
  if(transform.docChanged) {
    let newFrom = transform.mapping.map($from.pos);
    let newTo = transform.mapping.map($to.pos);
    $from = transform.doc.resolve(newFrom);
    $to = transform.doc.resolve(newTo);
  }

  //------------------------------
  // Add the worker parent
  //------------------------------

  {
    let parentDepth = 0;
    let nodeType = schema.nodes.workerParent;
    transform = wrapSelectionInNode($from,$to,parentDepth,nodeType,transform)
  }

  //-------------------------------
  // lift out of any lists!
  //-------------------------------

    //we will list one list per iteration, and keep doing this until there are no more lists
    let listInfo;
    do {
      let startGeneration = 0;
      
      //grab the worker node
      let { workerNode, workerContentStart } = getWorkerInfo(transform.doc);
      listInfo =  findContainedList(workerNode,workerContentStart,startGeneration);

      if(listInfo) {
        //remove list if one is found
        let $listContentsFrom = transform.doc.resolve(listInfo.contentsStart);
        let $listContentsTo = transform.doc.resolve(listInfo.contentsEnd);
        let listDepth = listInfo.listGenerations + 1;
        transform = liftContent($listContentsFrom,$listContentsTo,listDepth,transform);
      }
    } while(listInfo) 
  }

  //-------------------------------
  // convert the text blocks to the specified type
  // (there should only be text blocks)
  //-------------------------------

  {
    //get the content range for the worker node
    let {workerContentStart, workerContentEnd} = getWorkerInfo(transform.doc);

    transform = transform.setBlockType(workerContentStart, workerContentEnd, nodeType);
  }

  //------------------------------
  // lift out of the worker
  //------------------------------

  {
    //get the content range for the worker node
    let {workerContentStart, workerContentEnd} = getWorkerInfo(transform.doc);
    let $workerContentStart = transform.doc.resolve(workerContentStart);
    let $workerContentEnd = transform.doc.resolve(workerContentEnd);

    let workerDepth = 1;
    transform = liftContent($workerContentStart,$workerContentEnd,workerDepth,transform);
  }

  //------------------------------
  // execute the transform
  //------------------------------

  if((dispatch)&&(transform.docChanged)) {
    dispatch(transform);
  }
  
}

function convertToListBlockType(nodeType,state,dispatch) {
  //this will be our transform
  let transform = state.tr;

  //this is our range to convert
  let {$from, $to} = state.selection;

    //---------------------------
  //Split any lists so there is not a list that spans outside the current selection
  //Do after first so this doesn't change the value of $from yet.
  //---------------------------
  transform = splitSpannedListAfterPos($to,transform);
  transform = splitSpannedListBeforePos($from,transform);

  //update if we did any transform
  if(transform.docChanged) {
    let newFrom = transform.mapping.map($from.pos);
    let newTo = transform.mapping.map($to.pos);
    $from = transform.doc.resolve(newFrom);
    $to = transform.doc.resolve(newTo);
  }

  //------------------------------
  // Add the worker parent
  //------------------------------

  {
    let parentDepth = 0;
    let nodeType = schema.nodes.workerParent;
    transform = wrapSelectionInNode($from,$to,parentDepth,nodeType,transform)
  }

  //-------------------------------
  // lift out of any lists at the ROOT level (children will remain as child lists - but we must reset their type, below.)
  //-------------------------------

  {
    //get the top level lists
    //grab the worker node
    let { workerNode, workerContentStart } = getWorkerInfo(transform.doc);

    let doRecursive = false;
    let startGeneration = 0;
    let listInfos = getContainedLists(workerNode,workerContentStart,startGeneration,doRecursive);

    //go through top level lists in reverse order and lift out of them (so we don't have to worry about position changes here)
    for(let i = listInfos.length - 1; i >= 0; i--) {
      let listInfo = listInfos[i];

      //remove list if one is found
      let $listContentsFrom = transform.doc.resolve(listInfo.contentsStart);
      let $listContentsTo = transform.doc.resolve(listInfo.contentsEnd);
      let listDepth = listInfo.listGenerations + 1;
      transform = liftContent($listContentsFrom,$listContentsTo,listDepth,transform);
    }

  }

  //-------------------------------
  // make any remaining child lists the proper list type
  //-------------------------------

  {
    //get the top level lists
    //grab the worker node
    let { workerNode, workerContentStart } = getWorkerInfo(transform.doc);

    let doRecursive = true;
    let startGeneration = 0;
    let listInfos = getContainedLists(workerNode,workerContentStart,startGeneration,doRecursive);

    //go through top level lists in reverse order and lift out of them (so we don't have to worry about position changes here)
    for(let i = 0; i < listInfos.length; i++) {
      let listInfo = listInfos[i];

      //change the child list type if it does not match the current type
      if(listInfo.node.nodeType != nodeType) {
        let listNode = listInfo.node;
        let listOutsideFrom = listInfo.contentsStart-1;
        let listOutsideTo = listInfo.contentsEnd+1;
        transform = setNodeType(listNode,listOutsideFrom,listOutsideTo,listDepth,nodeType,transform);
      }
    }

  }

  //-------------------------------
  // convert the text blocks to list items
  //-------------------------------

  {
    //get the content range for the worker node
    let {workerContentStart, workerContentEnd} = getWorkerInfo(transform.doc);

    transform = transform.setBlockType(workerContentStart, workerContentEnd, schema.nodes.listItem);
  }

  //------------------------------
  // wrap all the items in a list
  //------------------------------
  {
    //get the worker node range
    let {workerContentStart, workerContentEnd} = getWorkerInfo(transform.doc);
    let $workerContentStart = transform.doc.resolve(workerContentStart);
    let $workerContentEnd = transform.doc.resolve(workerContentEnd);

    let parentDepth = 1;
    transform = wrapSelectionInNode($workerContentStart,$workerContentEnd,parentDepth,nodeType,transform)
  }

  //------------------------------
  // lift out of the worker
  //------------------------------

//  let workerIndex;

  {
    //get the content range for the worker node
    let {workerContentStart, workerContentEnd} = getWorkerInfo(transform.doc);
    let $workerContentStart = transform.doc.resolve(workerContentStart);
    let $workerContentEnd = transform.doc.resolve(workerContentEnd);

    //get the index of the worker before we remove it
    // {
    //   let parentDepth = 0;
    //   workerIndex = getNodeIndex($workerContentStart,parentDepth);
    // }

    let workerDepth = 1;
    transform = liftContent($workerContentStart,$workerContentEnd,workerDepth,transform);
  }

  //------------------------------
  // Check if there is a list of the same type before and after the updated selection. If so, join them.
  //------------------------------

  {
    //if the node before or after our new list is a list of the same type, it should be joined.
    //note we will also want to join common generation child lists...
  }

  //------------------------------
  // execute the transform
  //------------------------------

  if((dispatch)&&(transform.docChanged)) {
    dispatch(transform);
  }
  
}

/** This function cuts the document so there is not a list spanned before the text block at the given position. */
function splitSpannedListAfterPos($pos,transform) {
  let modPath = pathToModPath($pos.path);

  //traverse backwards to look for the deepest entry that cuts a list (last element is doc, we can ignore it)
  for(let i = modPath.length-1; i > 0; i--) {
    let entry = modPath[i];
    if(((entry.node.type == schema.nodes.bulletList)||(entry.node.type == schema.nodes.numberedList))&&(entry.index < entry.node.childCount-1)) {
      //split here!
      //cut at the end of the child block
      let childBlockDepth = i+1;
      let cutDepth = i;
      let cutPosition = $pos.end(childBlockDepth) + 1;
      transform = transform.split(cutPosition,cutDepth);
      break;
    }
  }

  return transform;
}

/** This function cuts the document so there is not a list spanned after the text block at the given position. */
function splitSpannedListBeforePos($pos,transform) {
  let modPath = pathToModPath($pos.path);

  //traverse backwards to look for the deepest entry that cuts list (last element is doc, we can ignore it)
  for(let i = modPath.length-1; i > 0; i--) {
    let entry = modPath[i];
    if(((entry.node.type == schema.nodes.bulletList)||(entry.node.type == schema.nodes.numberedList))&&(entry.index > 0)) {
      //split here!
      //cut at start of the child block
      let childBlockDepth = i+1; 
      let cutDepth = i;
      let cutPosition = $pos.start(childBlockDepth) - 1;
      transform = transform.split(cutPosition,cutDepth); //cut position off by 1 when at the start of a child list, but need to cut is parent
      break;
    }
  }

  return transform;
}

/** This load the path data into an alternat struct */
//helper
function pathToModPath(path) {
  let modPath = [];
  for(let i = 0; i < path.length-2; i+= 3) {
    let entry = {};
    entry.node = path[i];
    entry.index = path[i+1];
    entry.startPos = path[i+2];
    modPath.push(entry);
  }
  return modPath;
}

//depth is set to 0
function wrapSelectionInNode($from,$to,parentDepth,nodeType,transform) {
  let range = new NodeRange($from,$to,parentDepth);
  let wrapping = range && findWrapping(range, nodeType);
  if (!wrapping) throw new Error("Wrapping not found!"); //need to work out error handling
  //return the updated transform
  return transform.wrap(range, wrapping);
}

/** This finds the worker nodes in the doc. This will throw an error if there
 * is not a single worker node. */
function getWorkerInfo(doc) {
  let workerNodeInfo;
  doc.forEach( (node, offset) => {
    if(node.type == schema.nodes.workerParent) {
      if(workerNodeInfo !== undefined) throw new Error("Multiple worker nodes found!");

      workerNodeInfo = {};
      workerNodeInfo.workerNode = node;
      workerNodeInfo.workerContentStart = offset+1;
      workerNodeInfo.workerContentEnd = workerNodeInfo.contentStartPosition + node.content.size;
    }
  });
  if(workerNodeInfo === undefined) throw new Error("No worker nodes found!");
  return workerNodeInfo;
}

/** This function returns list info for a list contained in the given list. If the recursive 
 * flag is false it only returns list info for direct children. Otherwise it also returns further descendant lists, first.
 */
function findContainedList(parentNode,parentInsidePosition,parentListGeneration) {
  let listInfo;
  let position = parentInsidePosition;
  for(let i = 0; (i < parentNode.childCount)&&(!listInfo); i++) {
    let childNode = parentNode.child(i);
    listInfo = getListInfo(childNode,position,parentListGeneration);

    //update position for the next node
    position += childNode.size + 2;
  }
  return listInfo;
}

/** This function returns list info if this is a list node. If the recusrive flag is set,
 * it will return list info for a child list if there are any. */
//helper
function getListInfo(node,outsidePosition,parentListGeneration) { 
  let listInfo;

  if((node.type == schema.nodes.bulletList)||(node.type == schema.nodes.numberedList)) {
    //list found
    let currentListGeneration = parentListGeneration + 1;
    let currentListInsidePosition = outsidePosition + 1;

    //check for a child list
    listInfo = findContainedList(node,currentListInsidePosition,currentListGeneration);

    if(listInfo === undefined) {
      //set the list info for this list if no child found
      listInfo.node = node;
      listInfo.contentsStart = currentListInsidePosition
      listInfo.contentsEnd = listInfo.contentsStart + node.content.size;
      listInfo.listGeneration = currentListGeneration;
    }
  }

  return listInfo;
}

function getContainedLists(parentNode,parentInsidePosition,parentListGeneration,doRecursive) {
  let listInfos = [];
  let position = parentInsidePosition;
  for(let i = 0; i < parentNode.childCount; i++) {
    let childNode = parentNode.child(i);
    let childListInfo = getAllListInfo(childNode,position,parentListGeneration,doRecursive);
    listInfos = listInfos.concat(childListInfo);

    //update position for the next node
    position += childNode.size + 2;
  }

  return listInfos;
}

/** This function returns list info if this is a list node. If the recusrive flag is set,
 * it will return list info for a child list if there are any. */
//helper
function getAllListInfo(node,outsidePosition,parentListGeneration,doRecursive) { 
  let listInfos = [];

  if((node.type == schema.nodes.bulletList)||(node.type == schema.nodes.numberedList)) {
    //list found
    let currentListGeneration = parentListGeneration + 1;
    let currentListInsidePosition = outsidePosition + 1;

    //add the child lists
    let childListInfos = findContainedList(node,currentListInsidePosition,currentListGeneration,doRecursive);
    listInfos = listInfos.concat(childListInfos);

    //add the current list info
    let listInfo = {};
    listInfo.node = node;
    listInfo.contentsStart = currentListInsidePosition
    listInfo.contentsEnd = listInfo.contentsStart + node.content.size;
    listInfo.listGeneration = currentListGeneration;
  
    listInfos.push(listInfo);
  }

  return listInfo;
}

/** This function lifts the content at the given positions. It returns
 * the updated transform */
function liftContent($contentStart,$contentEnd,parentDepth,transform) {
  let range = new NodeRange($contentStart,$contentEnd,parentDepth);
  return transform.lift(range, parentDepth-1);
}

/** This changes the node type. It assumes the node type is valid. */
function setNodeType(node,outsideFromPos,outsideToPos,nodeType,transform) {
  transform.step(new ReplaceAroundStep(outsideFromPos, outsideToPos, outsideFromPos + 1, outsideToPos - 1,
                                      new Slice(Fragment.from(nodeType.create(null, null, node.marks)), 0, 0), 1, true));
  return transform;
}

/** This reads the path associated with the input position to find the index of the node at the requested depth. */
// function getNodeIndex($pos,parentDepth) {
//   let nodeIndexArrayIndex = parentDepth*3 + 1;
//   if($pos.path.length <= nodeIndexArrayIndex) throw new Exception("Error reading the node index - position depth to small!");
//   return $pos.path[nodeIndexArrayIndex];
// }

//end experimental commands
//=================================================================

let toolbarItems = [
  new ActionButton(convertToParagraphCommand,null,"Normal","atb_bold_style","temp"),
  new ActionButton(convertToH1Command,null,"H1","atb_bold_style","temp"),
  new ActionButton(convertToH2Command,null,"H2","atb_bold_style","temp"),
  new ActionButton(convertToH3Command,null,"H3","atb_bold_style","temp"),
  new ActionButton(convertToH4Command,null,"H4","atb_bold_style","temp"),
  new ActionButton(convertToBulletCommand,null,"Bullet","atb_bold_style","temp"),
  new ActionButton(convertToNumberedCommand,null,"Numbered","atb_bold_style","temp"),
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

  //new ActionButton(wrapInWorkerCommand,null,"Wrap In Worker","atb_italic_style","temp"),
  //new ActionButton(liftFromWorkerCommand,null,"Lift from Worker","atb_italic_style","temp"),
  //new ActionButton(liftLeastCommand,null,"Lift least","atb_italic_style","temp"),
  //new ActionButton(splitNonTextTop,null,"split top","atb_italic_style","temp"),
  //new ActionButton(splitNonTextBottom,null,"split bottom","atb_italic_style","temp"),
  //new ActionButton(joinUpCommand,null,"join up","atb_italic_style","temp"),
  //new ActionButton(joinDownCommand,null,"join down","atb_italic_style","temp"),
  //new ActionButton(wrapInBulletCommand,null,"Wrap In Bullet","atb_italic_style","temp"),
  //new ActionButton(setAsListItemCommand,null,"set as List Item","atb_italic_style","temp"),
  //new ActionButton(setAsParagraphCommand,null,"set as Para","atb_italic_style","temp"),
  //new ActionButton(setAsH1Command,null,"set as H1","atb_italic_style","temp"),
  //new ActionButton(setAsH2Command,null,"set as H2","atb_italic_style","temp"),
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




