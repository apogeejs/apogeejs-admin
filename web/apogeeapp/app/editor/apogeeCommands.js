//PROBLEMS
// FROM LIST
// - don't add tab at the start of lines from child lists
// TO LIST
// - don't merge at start and end
// - don't convert included lists to be the specified type
// - don't handle tabs at the start of non-list items, beign converted to child lists

import { findWrapping, ReplaceAroundStep } from "/prosemirror/lib/prosemirror-transform/src/index.js";
import { Slice, NodeRange } from "/prosemirror/lib/prosemirror-model/src/index.js"
import { Selection } from "/prosemirror/lib/prosemirror-state/src/index.js"

//--------------------------------------------------------
// Commands
//--------------------------------------------------------

// :: (EditorState, ?(tr: Transaction)) → bool
// When the selection is an empty list item in a top level list (not a child list)
// this creates a default block after the list
export function exitList(state, dispatch) {
    let { $head } = state.selection;
    let schema = state.schema;
    //make sure this is an empty list item in the root of a list
    if (($head.parent.type != schema.nodes.listItem) || ($head.depth != 2) || ($head.parent.content.size != 0)) return false;

    //only apply this for the last list item
    if( $head.node(1).childCount-1 > $head.index(1) ) return false;

    let above = $head.node(-2), after = $head.indexAfter(-2), type = above.contentMatchAt(after).defaultType
    if (!above.canReplaceWith(after, after, type)) return false
    if (dispatch) {
        let transform = state.tr;

        transform = transform.delete($head.pos - 1, $head.pos + 1);

        let inListAtEndPos = transform.mapping.map($head.pos);
        let afterListPos = inListAtEndPos + 1;

        transform = transform.replaceWith(afterListPos, afterListPos, type.createAndFill());

        let newTextBlockPos = afterListPos;

        transform.setSelection(Selection.near(transform.doc.resolve(newTextBlockPos), 1))
        dispatch(transform.scrollIntoView());
    }
    return true;
}

export function liftEmptyChildList(state, dispatch) {
    let { $head } = state.selection;
    let listItemDepth = $head.depth;
    let schema = state.schema;
    //make sure this is an empty list item in the root of a list
    if (($head.parent.type != schema.nodes.listItem) || (listItemDepth < 3) || ($head.parent.content.size != 0)) return false;

    //only apply this for the last list item
    if( $head.node(-1).childCount-1 > $head.index(-1) ) return false;

    if(dispatch) {
        //lift the list item
        let listDepth = listItemDepth-1;
        let transform = state.tr;
        transform = liftContent($head, $head, listDepth, transform);

        dispatch(transform.scrollIntoView());
    }

    return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If the cursor is in an empty textblock that can be lifted, lift the
// block.
export function liftEmptyBlock(state, dispatch) {
    let {$cursor} = state.selection
    if (!$cursor || $cursor.parent.content.size) return false
    if ($cursor.depth > 1 && $cursor.after() != $cursor.end(-1)) {
      let before = $cursor.before()
      if (canSplit(state.doc, before)) {
        if (dispatch) dispatch(state.tr.split(before).scrollIntoView())
        return true
      }
    }
    let range = $cursor.blockRange(), target = range && liftTarget(range)
    if (target == null) return false
    if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView())
    return true
  }


export function convertToNonListBlockType(nodeType, state, dispatch) {
    //this will be our transform
    let transform = state.tr;

    //this is our range to convert
    let { $from, $to } = state.selection;

    let schema = state.schema;

    //---------------------------
    //Split any lists so there is not a list that spans outside the current selection
    //Do after first so this doesn't change the value of $from yet.
    //---------------------------
    transform = splitSpannedListAfterPos($to, transform);
    transform = splitSpannedListBeforePos($from, transform);

    //update if we did any transform
    if (transform.docChanged) {
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
        transform = wrapSelectionInNode($from, $to, parentDepth, nodeType, transform)
    }

    //-------------------------------
    // lift out of any lists!
    //-------------------------------

    //we will list one list per iteration, and keep doing this until there are no more lists
    let listInfo;
    do {
        let startGeneration = 0;

        //grab the worker node
        let { workerNode, workerContentStart } = getWorkerInfo(transform.doc,schema);
        listInfo = findContainedList(workerNode, workerContentStart, startGeneration);

        if (listInfo) {
            //remove list if one is found
            let $listContentsFrom = transform.doc.resolve(listInfo.contentsStart);
            let $listContentsTo = transform.doc.resolve(listInfo.contentsEnd);
            let listDepth = listInfo.listGeneration + 1;
            transform = liftContent($listContentsFrom, $listContentsTo, listDepth, transform);
        }
    } while (listInfo)

    //-------------------------------
    // convert the text blocks to the specified type
    // (there should only be text blocks)
    //-------------------------------

    {
        //get the content range for the worker node
        let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);

        transform = transform.setBlockType(workerContentStart, workerContentEnd, nodeType);
    }

    //------------------------------
    // lift out of the worker
    //------------------------------

    {
        //get the content range for the worker node
        let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);
        let $workerContentStart = transform.doc.resolve(workerContentStart);
        let $workerContentEnd = transform.doc.resolve(workerContentEnd);

        let workerDepth = 1;
        transform = liftContent($workerContentStart, $workerContentEnd, workerDepth, transform);
    }

    //------------------------------
    // execute the transform
    //------------------------------

    if ((dispatch) && (transform.docChanged)) {
        dispatch(transform);
    }
}


export function convertToListBlockType(nodeType, state, dispatch) {
    //this will be our transform
    let transform = state.tr;

    //this is our range to convert
    let { $from, $to } = state.selection;

    let schema = state.schema;

    //---------------------------
    //Split any lists so there is not a list that spans outside the current selection
    //Do after first so this doesn't change the value of $from yet.
    //---------------------------
    transform = splitSpannedListAfterPos($to, transform);
    transform = splitSpannedListBeforePos($from, transform);

    //update if we did any transform
    if (transform.docChanged) {
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
        transform = wrapSelectionInNode($from, $to, parentDepth, nodeType, transform)
    }

    //-------------------------------
    // lift out of any lists at the ROOT level (children will remain as child lists - but we must reset their type, below.)
    //-------------------------------

    {
        //get the top level lists
        //grab the worker node
        let { workerNode, workerContentStart } = getWorkerInfo(transform.doc,schema);

        let doRecursive = false;
        let startGeneration = 0;
        let listInfos = getContainedLists(workerNode, workerContentStart, startGeneration, doRecursive);

        //go through top level lists in reverse order and lift out of them (so we don't have to worry about position changes here)
        for (let i = listInfos.length - 1; i >= 0; i--) {
            let listInfo = listInfos[i];

            //remove list if one is found
            let $listContentsFrom = transform.doc.resolve(listInfo.contentsStart);
            let $listContentsTo = transform.doc.resolve(listInfo.contentsEnd);
            let listDepth = listInfo.listGeneration + 1;
            transform = liftContent($listContentsFrom, $listContentsTo, listDepth, transform);
        }

    }

    //-------------------------------
    // make any remaining child lists the proper list type
    //-------------------------------

    {
        //get the top level lists
        //grab the worker node
        let { workerNode, workerContentStart } = getWorkerInfo(transform.doc,schema);

        let doRecursive = true;
        let startGeneration = 0;
        let listInfos = getContainedLists(workerNode, workerContentStart, startGeneration, doRecursive);

        //go through top level lists in reverse order and lift out of them (so we don't have to worry about position changes here)
        for (let i = 0; i < listInfos.length; i++) {
            let listInfo = listInfos[i];

            //change the child list type if it does not match the current type
            if (listInfo.node.nodeType != nodeType) {
                let listNode = listInfo.node;
                let listOutsideFrom = listInfo.contentsStart - 1;
                let listOutsideTo = listInfo.contentsEnd + 1;
                transform = setNodeType(listNode, listOutsideFrom, listOutsideTo, nodeType, transform);
            }
        }

    }

    //-------------------------------
    // convert the text blocks to list items
    //-------------------------------

    {
        //get the content range for the worker node
        let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);

        transform = transform.setBlockType(workerContentStart, workerContentEnd, schema.nodes.listItem);
    }

    //------------------------------
    // wrap all the items in a list
    //------------------------------
    {
        //get the worker node range
        let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);
        let $workerContentStart = transform.doc.resolve(workerContentStart);
        let $workerContentEnd = transform.doc.resolve(workerContentEnd);

        let parentDepth = 1;
        transform = wrapSelectionInNode($workerContentStart, $workerContentEnd, parentDepth, nodeType, transform)
    }

    //------------------------------
    // lift out of the worker
    //------------------------------

    //  let workerIndex;

    {
        //get the content range for the worker node
        let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);
        let $workerContentStart = transform.doc.resolve(workerContentStart);
        let $workerContentEnd = transform.doc.resolve(workerContentEnd);

        //get the index of the worker before we remove it
        // {
        //   let parentDepth = 0;
        //   workerIndex = getNodeIndex($workerContentStart,parentDepth);
        // }

        let workerDepth = 1;
        transform = liftContent($workerContentStart, $workerContentEnd, workerDepth, transform);
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

    if ((dispatch) && (transform.docChanged)) {
        dispatch(transform);
    }

}

/** This function cuts the document so there is not a list spanned before the text block at the given position. */
function splitSpannedListAfterPos($pos, transform) {
    let modPath = pathToModPath($pos.path);

    //traverse backwards to look for the deepest entry that cuts a list (last element is doc, we can ignore it)
    for (let i = modPath.length - 1; i > 0; i--) {
        let entry = modPath[i];
        if ((entry.node.type.spec.group == "list") && (entry.index < entry.node.childCount - 1)) {
            //split here!
            //cut at the end of the child block
            let childBlockDepth = i + 1;
            let cutDepth = i;
            let cutPosition = $pos.end(childBlockDepth) + 1;
            transform = transform.split(cutPosition, cutDepth);
            break;
        }
    }

    return transform;
}

/** This function cuts the document so there is not a list spanned after the text block at the given position. */
function splitSpannedListBeforePos($pos, transform) {
    let modPath = pathToModPath($pos.path);

    //traverse backwards to look for the deepest entry that cuts list (last element is doc, we can ignore it)
    for (let i = modPath.length - 1; i > 0; i--) {
        let entry = modPath[i];
        if ((entry.node.type.spec.group == "list") && (entry.index > 0)) {
            //split here!
            //cut at start of the child block
            let childBlockDepth = i + 1;
            let cutDepth = i;
            let cutPosition = $pos.start(childBlockDepth) - 1;
            transform = transform.split(cutPosition, cutDepth); //cut position off by 1 when at the start of a child list, but need to cut is parent
            break;
        }
    }

    return transform;
}

/** This load the path data into an alternat struct */
//helper
function pathToModPath(path) {
    let modPath = [];
    for (let i = 0; i < path.length - 2; i += 3) {
        let entry = {};
        entry.node = path[i];
        entry.index = path[i + 1];
        entry.startPos = path[i + 2];
        modPath.push(entry);
    }
    return modPath;
}

//depth is set to 0
function wrapSelectionInNode($from, $to, parentDepth, nodeType, transform) {
    let range = new NodeRange($from, $to, parentDepth);
    let wrapping = range && findWrapping(range, nodeType);
    if (!wrapping) throw new Error("Wrapping not found!"); //need to work out error handling
    //return the updated transform
    return transform.wrap(range, wrapping);
}

/** This finds the worker nodes in the doc. This will throw an error if there
 * is not a single worker node. */
function getWorkerInfo(doc,schema) {
    let workerNodeInfo;
    doc.forEach((node, offset) => {
        if (node.type == schema.nodes.workerParent) {
            if (workerNodeInfo !== undefined) throw new Error("Multiple worker nodes found!");

            workerNodeInfo = {};
            workerNodeInfo.workerNode = node;
            workerNodeInfo.workerContentStart = offset + 1;
            workerNodeInfo.workerContentEnd = workerNodeInfo.workerContentStart + node.content.size;
        }
    });
    if (workerNodeInfo === undefined) throw new Error("No worker nodes found!");
    return workerNodeInfo;
}

/** This function returns list info for a list contained in the given list. If the recursive 
 * flag is false it only returns list info for direct children. Otherwise it also returns further descendant lists, first.
 */
function findContainedList(parentNode, parentInsidePosition, parentListGeneration) {
    let listInfo;
    let position = parentInsidePosition;
    for (let i = 0; (i < parentNode.childCount) && (!listInfo); i++) {
        let childNode = parentNode.child(i);
        listInfo = getListInfo(childNode, position, parentListGeneration);

        //update position for the next node
        position += childNode.nodeSize;
    }
    return listInfo;
}

/** This function returns list info if this is a list node. If the recusrive flag is set,
 * it will return list info for a child list if there are any. */
//helper
function getListInfo(node, outsidePosition, parentListGeneration) {
    let listInfo;

    if (node.type.spec.group == "list") {
        //list found
        let currentListGeneration = parentListGeneration + 1;
        let currentListInsidePosition = outsidePosition + 1;

        //check for a child list
        listInfo = findContainedList(node, currentListInsidePosition, currentListGeneration);

        if (listInfo === undefined) {
            //set the list info for this list if no child found
            listInfo = {};
            listInfo.node = node;
            listInfo.contentsStart = currentListInsidePosition
            listInfo.contentsEnd = listInfo.contentsStart + node.content.size;
            listInfo.listGeneration = currentListGeneration;
        }
    }

    return listInfo;
}

function getContainedLists(parentNode, parentInsidePosition, parentListGeneration, doRecursive) {
    let listInfos = [];
    let position = parentInsidePosition;
    for (let i = 0; i < parentNode.childCount; i++) {
        let childNode = parentNode.child(i);
        let childListInfos = getAllListInfos(childNode, position, parentListGeneration, doRecursive);
        listInfos = listInfos.concat(childListInfos);

        //update position for the next node
        position += childNode.nodeSize;
    }

    return listInfos;
}

/** This function returns list info if this is a list node. If the recusrive flag is set,
 * it will return list info for a child list if there are any. */
//helper
function getAllListInfos(node, outsidePosition, parentListGeneration, doRecursive) {
    let listInfos = [];

    if (node.type.spec.group == "list") {
        //list found
        let currentListGeneration = parentListGeneration + 1;
        let currentListInsidePosition = outsidePosition + 1;

        //add the child lists
        if (doRecursive) {
            let childListInfos = getContainedLists(node, currentListInsidePosition, currentListGeneration, doRecursive);
            listInfos = listInfos.concat(childListInfos);
        }

        //add the current list info
        let listInfo = {};
        listInfo.node = node;
        listInfo.contentsStart = currentListInsidePosition
        listInfo.contentsEnd = listInfo.contentsStart + node.content.size;
        listInfo.listGeneration = currentListGeneration;

        listInfos.push(listInfo);
    }

    return listInfos;
}

/** This function lifts the content at the given positions. It returns
 * the updated transform */
function liftContent($contentStart, $contentEnd, parentDepth, transform) {
    let range = new NodeRange($contentStart, $contentEnd, parentDepth);
    return transform.lift(range, parentDepth - 1);
}

/** This changes the node type. It assumes the node type is valid. */
function setNodeType(node, outsideFromPos, outsideToPos, nodeType, transform) {
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

  //========================================
 // Keymap
 //========================================

import { createParagraphNear, splitBlock, deleteSelection, 
  joinBackward, joinForward, selectNodeBackward, selectNodeForward, selectAll,
  chainCommands  }  from "/prosemirror/lib/prosemirror-commands/src/commands.js";

let enter = chainCommands(exitList, createParagraphNear, liftEmptyChildList, splitBlock);
let backspace = chainCommands(exitList,deleteSelection, joinBackward, selectNodeBackward);
let del = chainCommands(deleteSelection, joinForward, selectNodeForward);

// :: Object
// A keymap for the apogee schema
let pcBaseKeymap = {
  "Enter": enter,
  //"Mod-Enter": exitCode,
  "Backspace": backspace,
  "Mod-Backspace": backspace,
  "Delete": del,
  "Mod-Delete": del,
  "Mod-a": selectAll
}

// :: Object
// A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
// **Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
// **Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
// Ctrl-Delete.
let macBaseKeymap = {
  "Ctrl-h": pcBaseKeymap["Backspace"],
  "Alt-Backspace": pcBaseKeymap["Mod-Backspace"],
  "Ctrl-d": pcBaseKeymap["Delete"],
  "Ctrl-Alt-Backspace": pcBaseKeymap["Mod-Delete"],
  "Alt-Delete": pcBaseKeymap["Mod-Delete"],
  "Alt-d": pcBaseKeymap["Mod-Delete"]
}
for (let key in pcBaseKeymap) macBaseKeymap[key] = pcBaseKeymap[key]

// declare global: os, navigator
const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform)
          : typeof os != "undefined" ? os.platform() == "darwin" : false

// :: Object
// Depending on the detected platform, this will hold
// [`pcBasekeymap`](#commands.pcBaseKeymap) or
// [`macBaseKeymap`](#commands.macBaseKeymap).
export let baseKeymap = mac ? macBaseKeymap : pcBaseKeymap

