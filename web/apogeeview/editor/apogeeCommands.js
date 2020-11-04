//PROBLEMS
// FROM LIST
// - don't add tab at the start of lines from child lists
// TO LIST
// - don't merge at start and end
// - don't convert included lists to be the specified type
// - don't handle tabs at the start of non-list items, beign converted to child lists

import { findWrapping, /*ReplaceStep,*/ ReplaceAroundStep } from "/prosemirror/dist/prosemirror-transform.es.js";
import { Slice, NodeRange, Fragment } from "/prosemirror/dist/prosemirror-model.es.js"
import { TextSelection } from "/prosemirror/dist/prosemirror-state.es.js"

//--------------------------------------------------------
// Commands
//--------------------------------------------------------

// :: (EditorState, ?(tr: Transaction)) → bool
// If we are in a top level list, this will convert the line to a paragraph type block
export function exitEmptyList(state, dispatch) {
    let { $head } = state.selection;
    let schema = state.schema;
    //make sure this is an empty list item in the root of a list
    if (($head.parent.type != schema.nodes.listItem) || ($head.depth != 2) || ($head.parent.content.size != 0)) return false;

    //set this block type to default
    return setBlockType(schema.nodes.paragraph, state, dispatch);
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If we are in a top level list at the start of the line, this will convert the line to a paragraph type block
export function exitFromStartOfList(state, dispatch) {
    let { $head, empty } = state.selection;
    let schema = state.schema;
    if((empty)&&($head.parent.type == schema.nodes.listItem)&&($head.parentOffset == 0)) {
        return setBlockType(schema.nodes.paragraph, state, dispatch);
    }
    else {
        return false;
    }
 }

 // :: (EditorState, ?(tr: Transaction)) → bool
// If we are at the end of a top level list and the next block is a text block, this pulls
// that text block into the list.
export function joinNextBlockToListFromEnd(state,dispatch) {
    let { empty, $head } = state.selection;
    let schema = state.schema;
    if((empty) && //empty selection
            ($head.parent.type == schema.nodes.listItem) && //in a list item
            ($head.parentOffset == $head.parent.content.size) && //at end of list item
            ($head.index($head.depth-1)+1 == $head.node($head.depth-1).childCount) //last list item
        ) { 
        //WE ARE ASSUMING ONLY SINGLE LEVEL LISTS HERE!!!
        let nextNodeStartPos = $head.after($head.depth-1);
        let nextNode = state.doc.resolve(nextNodeStartPos).nodeAfter;
        //only pull next node in if it is a text block
        if((nextNode)&&(nextNode.isTextblock)) {
            let $insideNextNode = state.doc.resolve(nextNodeStartPos+1);
            //get the selection up to the inside of the next node
            let newSelection = new TextSelection($head,$insideNextNode)
            let tr = state.tr.setSelection(newSelection).deleteSelection();
            if(dispatch) {
                dispatch(tr.scrollIntoView())
            }
        }
        
        //if we get here the command is not valid
        return true;
    }
}

 // :: (EditorState, ?(tr: Transaction)) → bool
// If we are at the end of a top level list and the next block is a text block, this pulls
// that text block into the list.
export function joinNextBlockFromListFromEnd(state,dispatch) {
    let { empty, $head } = state.selection;
    if((empty) && //empty selection
            ($head.parent.isTextblock) && //in a text block
            ($head.depth == 1) && //at the top level
            ($head.parentOffset == $head.parent.content.size) //at end
        ) { 
        let nextNodeStartPos = $head.after($head.depth);
        let nextNode = state.doc.resolve(nextNodeStartPos).nodeAfter;
        //only pull next node in if it is in a list
        if((nextNode)&&(nextNode.type.spec.group == "list")) {
            //WE ARE ASSUMING ONLY SINGLE LEVEL LISTS HERE!!!
            let $insideNextListItemNode = state.doc.resolve(nextNodeStartPos+2);
            //get the selection up to the inside of the next node
            let newSelection = new TextSelection($head,$insideNextListItemNode)
            let tr = state.tr.setSelection(newSelection).deleteSelection();
            if(dispatch) {
                dispatch(tr.scrollIntoView())
            }
        }
        
        //if we get here the command is not valid
        return true;
    }
}

export function setMark(markType, attrs, state, dispatch) {
    let { empty, $cursor, ranges } = state.selection
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
    if (dispatch) {
        if ($cursor) {
            dispatch(state.tr.addStoredMark(markType.create(attrs)))
        }
        else {
            let tr = state.tr
            for (let i = 0; i < ranges.length; i++) {
                let { $from, $to } = ranges[i]
                tr.addMark($from.pos, $to.pos, markType.create(attrs))
            }
            dispatch(tr.scrollIntoView())
        }
    }
    return true
}


export function clearMark(markType, state, dispatch) {
    let { empty, $cursor, ranges } = state.selection
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
    if (dispatch) {
        if ($cursor) {
            dispatch(state.tr.removeStoredMark(markType))
        }
        else {
            let tr = state.tr
            for (let i = 0; i < ranges.length; i++) {
                let { $from, $to } = ranges[i]
                tr.removeMark($from.pos, $to.pos, markType)
            }
            dispatch(tr.scrollIntoView())
        }
    }
    return true
}

function markApplies(doc, ranges, type) {
    for (let i = 0; i < ranges.length; i++) {
        let { $from, $to } = ranges[i]
        let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false
        doc.nodesBetween($from.pos, $to.pos, node => {
            if (can) return false
            can = node.inlineContent && node.type.allowsMarkType(type)
        })
        if (can) return true
    }
    return false
}


//--
//to non-list block type commands
//--

/** This function converts a selection to a new non-list block type. */
export function setBlockType(nodeType, state, dispatch) {

    //this will be our transform
    let transform = state.tr;    
    let schema = state.schema;
    let selection = state.selection;

    //node type setup
    let targetTextBlockType = (nodeType.spec.group == "list") ? schema.nodes.listItem : nodeType;
    let listTypeIfApplicable;
    if(nodeType.spec.group == "list") {
        listTypeIfApplicable = nodeType;
        targetTextBlockType = schema.nodes.listItem;
    }
    else {
        listTypeIfApplicable = null;
        targetTextBlockType = nodeType;
    }

    //------------------------------
    //if there are start and end lists, split them from the selection to update
    //------------------------------
    transform = splitStartAndEndLists(transform,selection,schema);

    //------------------------------
    // Wrap selected nodes in a worker block - this lets us hold basre list items
    //------------------------------
    transform = wrapSelectionInWorkerParent(transform,selection,schema);

    //------------------------------
    // Lift out any lists in the worker block
    //------------------------------
    transform = liftFromAnyListsInWorkerParent(transform,schema);

    //------------------------------
    // Convert all blocks to desired type, except ignore apogee blocks
    //------------------------------
    transform = convertWorkerParentChildren(transform,targetTextBlockType,schema)

    //------------------------------
    // Get rid of worker block
    //------------------------------
    transform = removeWorkerBlock(transform,listTypeIfApplicable,schema);

    //------------------------------
    // Join any lists at start and end if applicable
    //------------------------------
    if(listTypeIfApplicable) {
        transform = joinNeighboringLists(transform);
    }

    //------------------------------
    // additional validation??? see if there are any worker parent or unwrapper lists
    //------------------------------
    if(newDocumentInvalidAfterBlockChange(transform)) return false;
    
    //------------------------------
    // execute the transform
    //------------------------------

    if ((dispatch) && (transform.docChanged)) {
        dispatch(transform);
    }

    return true;
}

//===============================
// Support Functions
//===============================

/** Split any lists so there is not a list that spans outside the current selection */
function splitStartAndEndLists(transform,selection,schema) {
    //this is our range to convert
    let { $from, $to } = selection;
    transform = splitSpannedListAfterPos($to, transform, schema);
    transform = splitSpannedListBeforePos($from, transform, schema);
    return transform;
}


/** This function wraps the given selection in one or more worker parent nodes, with any apogee
 * component nodes excluded.
 */
function wrapSelectionInWorkerParent(transform,selection,schema) {

    let refDoc = transform.doc;
    let refStep = transform.steps.length;

    //this is our range to convert
    let { $from, $to } = selection;

    //update if we have done any transform
    if (transform.docChanged) {
        let newFrom = transform.mapping.map($from.pos);
        let newTo = transform.mapping.map($to.pos);
        $from = refDoc.resolve(newFrom);
        $to = refDoc.resolve(newTo);
    }

    //get start and end index in top level
    let firstIndex = $from.index(0);
    let lastIndex = $to.index(0);

    let startPosition;
    let endPosition;
    let inFutureList = false;
    let insertDepth = 0;
    refDoc.forEach( (node,offset,index) => {
        if((index >= firstIndex)&&(index <= lastIndex)) {

            if(node.type === schema.nodes.apogeeComponent) {
                if(inFutureList) {
                    inFutureList = false;
                    endPosition = offset;
                    //wrap in a worker parent
                    insertDepth = 0;
                    wrapSelectionInNode(startPosition,endPosition,insertDepth,schema.nodes.workerParent,transform,refStep);
                }
            }
            else {
                if(!inFutureList) {
                    inFutureList = true;
                    //set the start position
                    startPosition = offset;
                }
                //update the end position
                endPosition = offset + node.nodeSize;
            }
    
        }
    });

    //create the final list/worker segment
    if(inFutureList) {
        wrapSelectionInNode(startPosition,endPosition,insertDepth,schema.nodes.workerParent,transform,refStep);
    }

    return transform;
}

/** This function lifts the child blocks from an list blocks included in the worker parent block(s). */
function liftFromAnyListsInWorkerParent(transform,schema) {
    let doc = transform.doc;
    let refStep = transform.steps.length;

    doc.forEach( (childNode,offset,index) => {
        //process worker parents in the doc
        if(childNode.type == schema.nodes.workerParent) {
            let childPosition = offset
            childNode.forEach( (grandchildNode,childOffset,childIndex) => {
                //unwrap any list node
                if(grandchildNode.type.spec.group == "list") {
                    let grandchildPosition = childPosition + 1 + childOffset;
                    unwrapChildren(grandchildNode,grandchildPosition,transform,refStep);
                }
            });
        }
    });

    return transform;
}

/** This function changes any child block node in the worker parent node(s) to the target text
 * block type. */
function convertWorkerParentChildren(transform,targetTextBlockType,schema) {
    let doc = transform.doc;
    let refStep = transform.steps.length;

    doc.forEach( (childNode,offset,index) => {
        //work on children or the worker parent
        if(childNode.type == schema.nodes.workerParent) {
            let childPosition = offset
            //change block type to target type
            childNode.forEach( (grandchildNode,childOffset,childIndex) => {
                let grandchildPosition = childPosition + 1 + childOffset;
                convertBlockType(targetTextBlockType,null,grandchildNode,grandchildPosition,transform,refStep);
            });
        }
    });

    return transform;
}

/** This function removes and worker blocks in the document. If the worker block should be
 * a list, it is converted to that list type. Otherwise the child blocks are just lifted out. */
function removeWorkerBlock(transform,listTypeIfApplicable,schema) {
    //FIX THIS
    //convert worker children to target link and remove worker 
    //get the updated doc
    let doc = transform.doc;
    let refStep = transform.steps.length;

    doc.forEach( (childNode,offset,index) => {
        if(childNode.type == schema.nodes.workerParent) {
            let childPosition = offset

            if(listTypeIfApplicable) {
                //if this should be a list, convert worker parent to list
                convertBlockType(listTypeIfApplicable,null,childNode,childPosition,transform,refStep);
            }
            else {
                //otherwise lift out of worker block
                unwrapChildren(childNode,childPosition,transform,refStep);
            }
        }
    });

    return transform;
}

/** This goes through the document and joins any lists that are next to each other. */
function joinNeighboringLists(transform) {
    /* ADD THIS LATER */
    return transform;
}

/** This method checks for errors in a document after a block change*/
function newDocumentInvalidAfterBlockChange(transform) {
    /* ADD THIS LATER */
    return false;
}


/** This function cuts the document so there is not a list spanned before the text block at the given position. */
function splitSpannedListAfterPos($pos, transform, schema) {

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
function splitSpannedListBeforePos($pos, transform, schema) {
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


//depth is set to 0
function wrapSelectionInNode(baseFrom, baseTo, parentDepth, nodeType, transform, refStep) {
    let mapping = transform.mapping.slice(refStep);
    let from = mapping.map(baseFrom, 1);
    let to = mapping.map(baseTo, -1);
    let $from = transform.doc.resolve(from);
    let $to = transform.doc.resolve(to);
    let range = new NodeRange($from, $to, parentDepth);
    let wrapping = range && findWrapping(range, nodeType);
    if (!wrapping) throw new Error("Wrapping not found!"); //need to work out error handling
    //return the updated transform
    return transform.wrap(range, wrapping);
}

/** This lifts children of the given node out of that node. */
function unwrapChildren(node,nodeRefStart,transform,refStep) {
    //get the mapping to remap the node position
    let mapping = transform.mapping.slice(refStep);
    let start = mapping.map(nodeRefStart, 1);
    let end = mapping.map(nodeRefStart + node.nodeSize, 1);

    //return transform.step(new ReplaceStep(start, end, new Slice(node.content, 0, 0), false))

    return transform.step(new ReplaceAroundStep(start, end, start + 1, end - 1,
        new Slice(Fragment.empty, 0, 0), 0, false))
}

/** This method converts the given block into the targetnode type. */
function convertBlockType(targetNodeType,attrs,node,nodeRefStart,transform,refStep) {
    //get the mapping to remap the node position
    let mapping = transform.mapping.slice(refStep);
    let start = mapping.map(nodeRefStart, 1);
    let end = mapping.map(nodeRefStart + node.nodeSize, 1);
    return transform.step(new ReplaceAroundStep(start, end, start + 1, end - 1,
            new Slice(Fragment.from(targetNodeType.create(attrs, null, node.marks)), 0, 0), 1, true))
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

//===================================================================
/** Special work around
 * Using the standard document logic, if an apogee node is the first node (and it is not the only node) then
 * when a user presses enter the new paragraph will be created _above_ the node. I don't want this.
 *This logic will detect that single case and put the new paragraph after. */
function insertParagraphAfterFirstApogeeNode(state,dispatch) {
    let {$from, $to} = state.selection;
    let schema = state.schema;
    //only run this if we are at the start of the doc
    if($from.pos !== 0) return;

    //see if the selection is a single apogee node (we can probably use a general function for this)
    //THIS MIGHT NEED TO BE UPDATED, for now you can only select a single apogee node
    let apogeeNodeCount = 0;
    let nonApogeeNodeCount = 0;
    let checkNodes = (node, pos, parent, index) => {
        (node.type == schema.nodes.apogeeComponent) ? apogeeNodeCount++ : nonApogeeNodeCount++;
        return false;
    }
    state.doc.nodesBetween($from.pos,$to.pos,checkNodes);

    if((apogeeNodeCount !== 1)&&(nonApogeeNodeCount !== 0)) return;

    //create a paragraph after the node
    if (dispatch) {;
        let typeToCreate = schema.nodes.paragraph
        let pos = $to.pos;
        let tr = state.tr.insert(pos, typeToCreate.createAndFill());
        tr.setSelection(TextSelection.create(tr.doc, pos + 1));
        dispatch(tr.scrollIntoView());
    }
    return true
}


//========================================
 // Keymap
 //========================================

import { createParagraphNear, splitBlock, deleteSelection, 
  joinBackward, joinForward, selectAll,
  chainCommands  }  from "/prosemirror/dist/prosemirror-commands.es.js";

let enter = chainCommands(exitEmptyList, insertParagraphAfterFirstApogeeNode, createParagraphNear, splitBlock);
let backspace = chainCommands(exitEmptyList,deleteSelection, joinBackward, exitFromStartOfList);
let del = chainCommands(deleteSelection, joinForward, joinNextBlockToListFromEnd, joinNextBlockFromListFromEnd);

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

// :: Object
// Depending on the detected platform, this will hold
// [`pcBasekeymap`](#commands.pcBaseKeymap) or
// [`macBaseKeymap`](#commands.macBaseKeymap).
export let baseKeymap = __OS_IS_MAC__ ? macBaseKeymap : pcBaseKeymap

