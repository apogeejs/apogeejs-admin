//PROBLEMS
// FROM LIST
// - don't add tab at the start of lines from child lists
// TO LIST
// - don't merge at start and end
// - don't convert included lists to be the specified type
// - don't handle tabs at the start of non-list items, beign converted to child lists

import { findWrapping, ReplaceStep, ReplaceAroundStep } from "/prosemirror/lib/prosemirror-transform/src/index.js";
import { Slice, NodeRange, Fragment } from "/prosemirror/lib/prosemirror-model/src/index.js"
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

//--
//to non-list block type commands
//--

/** This function converts a selection to a new non-list block type. */
export function convertToNonListBlockType(nodeType, state, dispatch) {

    //some input checking
    if(nodeType.spec.group == "list") return false;

    //this will be our transform
    let transform = state.tr;    
    let schema = state.schema;
    let selection = state.selection;

    //------------------------------
    //if there are start and end lists, split them from the selection to update
    //------------------------------
    transform = splitStartAndEndLists(transform,selection);

    //---------------------------
    // -traverse the top level nodes (the ones in the doc) and process each
    //----------------------------

    transform = convertSelectedBlocksToNonList(transform,nodeType,selection,schema);
    
    //------------------------------
    // execute the transform
    //------------------------------

    if ((dispatch) && (transform.docChanged)) {
        dispatch(transform);
    }

    return true;

}

/** This traverses the list of nodes in the selection and converts them to the 
 * specified non-list type. Before this is called, any lists at the start and end
 * of the selection that go oustide the selection should be split, on list item boundaries.
 */
function convertSelectedBlocksToNonList(transform,nodeType,selection,schema) {

    //set the baseline for the document and the reference step for position mapping 
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

    //traverse nodes, converting them to node type
    refDoc.forEach( (node,offset,index) => {
        if((index >= firstIndex)&&(index <= lastIndex)) {
            
            if(node.type.spec.group == "list") {
                //convert list entry to non list
                convertListToNonList(nodeType,null,node,offset,transform,refStep,schema);
            }
            else if(node.isTextblock) {
                //convert block type
                if(node.type != nodeType) {
                    convertBlockType(nodeType,null,node,offset,transform,refStep);
                }
            }
            else if(node.nodeType === schema.nodes.apogeeComponent) {
                //no action on apogee nodes
            }
            else {
                //this shouldn't happen
                throw new Error("Unexpected editor node type: " + node.nodeType.name);
            }
        }
    });

    return transform;
}


/** This converts the list to a parent worker, and then traverses the child nodes -
 * It updates child list items to the proper target node type. It lifts content out of any child list
 */
function convertListToNonList(targetNodeType,attrs,node,nodeRefStart,transform,refStep,schema) {
    //convert outer type to worker parent
    //traverse child
    //- list item - change to target type
    //- list - (1) recursively lift content (2) convet to target node type

    //convert top level list to worker parent
    convertBlockType(schema.nodes.workerParent,attrs,node,nodeRefStart,transform,refStep);

    //insert leading tabs on indented line (no leading tab on lowest level of list = "")
    insertLeadingStringOnIndentedLines(node,"",nodeRefStart,transform,refStep,schema);
    
    //flatten the lists inside
    recursiveListUnwrap(node,nodeRefStart,transform,refStep,0,1,schema);

    //convert worker children to target link and remove worker 
    convertBlocksToProperTypes(targetNodeType,attrs,transform,schema);

}

/** This lifts children of the given node out of that node. */
function insertLeadingStringOnIndentedLines(node,linePrefix,nodeRefStart,transform,refStep,schema) {
    //traverse the child nodes
    
    node.forEach( (childNode,offset,index) => {
        let childNodeRefStart = nodeRefStart + 1 + offset;
        if((childNode.type == schema.nodes.listItem)&&(linePrefix.length > 0)) {     
            //get the updated mapping and text location
            let mapping = transform.mapping.slice(refStep);
            let childNodeStart = mapping.map(childNodeRefStart);
            let textStart = childNodeStart + 1;
            transform.insertText(linePrefix,textStart,textStart);
        }
        else if(childNode.type.spec.group == "list") {
            //recursive call to insert tabs
            insertLeadingStringOnIndentedLines(childNode,linePrefix + "\t",childNodeRefStart,transform,refStep,schema);
        }
    });

    return transform;
}

/** This function unwraps a list, so that the list can be flattened. */
function recursiveListUnwrap(node,nodeRefStart,transform,refStep,listDepth,minListDepthToFlatten,schema) {
    //unwrap the children
    let childListDepth = listDepth + 1;
    node.forEach( (childNode,offset,index) => {
        let refPosition = nodeRefStart + 1 + offset;
        if(childNode.type.spec.group == "list") {
            recursiveListUnwrap(childNode,refPosition,transform,refStep,childListDepth,minListDepthToFlatten,schema);
        }
    });

    //unwrap this list, including adding a tab for any indents
    if(minListDepthToFlatten <= listDepth) {
        unwrapChildren(node,nodeRefStart,transform,refStep);
    }
}

/** This function is used in converting to a non-list block type. That start point should be 
 * a worker parent node with text blocks inside - either list items or non-list text blocks.
 * The doc should _only_ contain worker parents in this format. All will be converted. 
 * This converts the inside blocks to the target node format and unwraps the contents from the 
 * worker parent node. */
function convertBlocksToProperTypes(targetNodeType,attrs,transform,schema) {
    //convert worker children to target link and remove worker 
    //get the updated doc
    let doc = transform.doc;
    let refStep = transform.steps.length;

    doc.forEach( (childNode,offset,index) => {
        if(childNode.type == schema.nodes.workerParent) {
            let childPosition = offset

            childNode.forEach( (grandchildNode,childOffset,childIndex) => {
                let grandchildPosition = childPosition + 1 + childOffset;
                convertBlockType(targetNodeType,attrs,grandchildNode,grandchildPosition,transform,refStep);
            });

            unwrapChildren(childNode,childPosition,transform,refStep);
        }
    });
}

//--
//to non-list block type commands
//--

/** This function converts a selection to a new list block type. */
export function convertToListBlockType(nodeType, state, dispatch) {

    //some input checking
    if(nodeType.spec.group != "list") return false;

    //this will be our transform
    let transform = state.tr;
    let schema = state.schema;
    
    //------------------------------
    //if there are start and end lists, split them from the selection to update
    //------------------------------
    transform = splitStartAndEndLists(transform,state.selection);

    //-------------------------------
    // Wrap continueous ranges of non-apogee component nodes in a worker parent, which will be our end list(s). 
    //-------------------------------

    transform = wrapSelectionInWorkerParent(transform,state.selection,schema);

    //---------------------------
    // process each future list node
    //----------------------------

    transform = processWorkerContentsToListContents(transform,nodeType,schema);

    //------------------------------
    // Convert worker parents to target list and add indent for leading tabs
    //------------------------------
    let refDoc = transform.doc;
    let refStep = transform.steps.length;
    let attrs = null;

    refDoc.forEach( (childNode,offset,index) => {
        if(childNode.type == schema.nodes.workerParent) {
            let childPosition = offset
            
            //convert worker to target list type
            convertBlockType(nodeType,attrs,childNode,childPosition,transform,refStep);

            //add indent for top level list items with leading tabs
            addIndentForTab(nodeType,attrs,childNode,childPosition,transform,refStep,schema);

        }
    });

    //------------------------------
    // execute the transform
    //------------------------------

    if ((dispatch) && (transform.docChanged)) {
        dispatch(transform);
    }

    return true;

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
    refDoc.forEach( (node,offset,index) => {
        if((index >= firstIndex)&&(index <= lastIndex)) {

            if(node.type === schema.nodes.apogeeComponent) {
                if(inFutureList) {
                    inFutureList = false;
                    endPosition = offset;
                    wrapInWorker(startPosition,endPosition,transform,schema,refStep);
                }
            }
            else {
                if(!inFutureList) {
                    inFutureList = true;
                    startPosition = offset;
                }
            }
    
        }
    });

    //create the final list/worker segment
    if(inFutureList) {
        endPosition = $to.pos;
        wrapInWorker(startPosition,endPosition,transform,schema,refStep);
    }

    return transform;
}

/** This method wraps the given range, relative the old tranform state as given by refStep, in a worker parent node. */
function wrapInWorker(startBasePosition,endBasePosition,transform,schema,refStep) {
    let mapping = transform.mapping.slice(refStep);
    let startPosition = mapping.map(startBasePosition, 1);
    let endPosition = mapping.map(endBasePosition, -1);
    let $workerFrom = transform.doc.resolve(startPosition);
    let $workerTo = transform.doc.resolve(endPosition);
    let futureListParentDepth = 0;
    wrapSelectionInNode($workerFrom, $workerTo, futureListParentDepth, schema.nodes.workerParent, transform);
}

/** This method updates the top level nodes to match the desired list type. */
function processWorkerContentsToListContents(transform,nodeType,schema) {
    
    let refDoc = transform.doc;
    let refStep = transform.steps.length;

    refDoc.forEach( (node,offset,index) => {
        if(node.type == schema.nodes.workerParent) {
            let workerPosition = offset;

            node.forEach( (childNode,childOffset,index) => {
                let childPosition = workerPosition + 1 + childOffset;
            
                if(childNode.type.spec.group == "list") {
                    //lift children from al top level lists (the worker parent will be the list)
                    unwrapChildren(childNode,childPosition,transform,refStep);
                }
                else if(childNode.isTextblock) {
                    //convert all text block entries into list items
                    if(childNode.type != schema.nodes.listItem) {
                        convertBlockType(schema.nodes.listItem,null,childNode,childPosition,transform,refStep);
                    }
                }
                else if(childNode.type === schema.nodes.apogeeComponent) {
                    //OOPS - this should not be in list!!! but ignore it
                }
                else {
                    //this shouldn't happen
                    throw new Error("Unexpected editor node type: " + childNode.type.name);
                }
            });
        }
    });

    return transform;
}

//add indent for top level list items with leading tabs
function addIndentForTab(nodeType,attrs,listNode,baseListPosition,transform,refStep,schema) {

    //traverse child nodes
    //for top level list items, record the number of leading tabs
    //store a "indent summary": indent count for each node, along with position of start
    //insert list nodes based on changes in indent 
    let mapping = transform.mapping.slice(refStep);
    let listPosition = mapping.map(baseListPosition);

    //--------------------
    //create a list with the tab indent level for each non-list block
    //---------------------
    let indentInfo = [];

    //add a dummy entry at start with 0 indent
    let initialIndentEntry = {};
    initialIndentEntry.nodeStart = listPosition + 1;
    initialIndentEntry.indent = 0;
    indentInfo.push(initialIndentEntry);

    listNode.forEach( (childNode,childOffset,index) => {
        let indentEntry = {};
        indentEntry.nodeStart = listPosition + 1 + childOffset;
        indentInfo.push(indentEntry);

        if(childNode.type == schema.nodes.listItem) {
            indentEntry.indent = countLeadingTabs(childNode);
        }
        else {
            indentEntry.indent = 0;
        }
    });

    //add a dummy entry at end with 0 indent
    let finalIndentEntry = {};
    finalIndentEntry.nodeStart = listPosition + 1 + listNode.content.size;
    finalIndentEntry.indent = 0;
    indentInfo.push(finalIndentEntry);

    //----------------------
    //create a list of ranges where we should have list nodes
    //----------------------
    let listRanges = [];
    let activeListRanges = [];
    let previousIndentEntry;
    indentInfo.forEach( currentIndentEntry => {
        if(previousIndentEntry) {
            if(currentIndentEntry.indent > previousIndentEntry.indent) {
                //add a list, or multiple (indent)
                for(let indent = previousIndentEntry.indent + 1; indent <= currentIndentEntry.indent; indent++) {
                    let listRangeEntry = {}
                    listRangeEntry.startPos = currentIndentEntry.nodeStart;
                    listRangeEntry.indent = indent;
                    listRanges.push(listRangeEntry);
                    activeListRanges.push(listRangeEntry);
                }
            }
            else if(currentIndentEntry.indent < previousIndentEntry.indent) {
                //remove a list,or multiple (unindent)
                for(let indent = previousIndentEntry.indent - 1; indent >= currentIndentEntry.indent; indent--) {
                    if(activeListRanges.length === 0) throw new Error("Unknown error constructing indented lists");
                    let closeRangeEntry = activeListRanges.pop();
                    closeRangeEntry.endPos = currentIndentEntry.nodeStart;
                }
            }
        }
        previousIndentEntry = currentIndentEntry;
    });

    //----------------------
    // delete leading tabs
    //----------------------
    indentInfo.forEach( indentEntry => {
        if(indentEntry.indent > 0) {
            let tabRefStart = indentEntry.nodeStart + 1; //start pos is the start of the list item
            let tabRefEnd = tabRefStart + indentEntry.indent;
            let mapping = transform.mapping.slice(refStep);
            let tabStart = mapping.map(tabRefStart, 1);
            let tabEnd = mapping.map(tabRefEnd, 1);
            transform.delete(tabStart,tabEnd);
        }
    });

    //----------------------
    // insert the list nodes for indenting
    //----------------------
    console.log(JSON.stringify(listRanges));

    listRanges.forEach( listRangeEntry => {
        let mapping = transform.mapping.slice(refStep);
        let startPosition = mapping.map(listRangeEntry.startPos, 1);
        let endPosition = mapping.map(listRangeEntry.endPos, -1);
        let $listFrom = transform.doc.resolve(startPosition);
        let $listTo = transform.doc.resolve(endPosition);
        let listParentDepth = listRangeEntry.indent;
        wrapSelectionInNode($listFrom, $listTo, listParentDepth,nodeType, transform);
    });
    
}

/** This function counts the nubmer of tabs in a text block node. */
function countLeadingTabs(textblockNode) {
    if(!textblockNode.isTextblock) throw new Error("Text block expected");

    let tabCount = 0;
    for(let nodeIndex = 0; nodeIndex < textblockNode.content.content.length; nodeIndex++) {
        let textNode = textblockNode.content.content[nodeIndex];
        for(let charIndex = 0; charIndex < textNode.text.length; charIndex++) {
            let textChar = textNode.text.charAt(charIndex);
            if(textChar == "\t") tabCount++;
            else return tabCount;
        }
    }
    //we will get here if the list item has only tabs
    return tabCount;

}

export function indentSelection(state, dispatch) {
    //this will be our transform
    let transform = state.tr;
    let schema = state.schema;

    //set the baseline for the document and the reference step for position mapping 
    let refDoc = transform.doc;
    let refStep = transform.steps.length;

    //this is our range to convert
    let { $from, $to } = state.selection;

    //get top level node
    let startTopNode = $from.node(1);
    let endTopNode = $to.node(1);
    let mainStartPos = $from.start(1);

    //require we are in a single list item
    if((startTopNode.type.spec.group != "list")||(startTopNode != endTopNode)) return false;
    let listNode = startTopNode;

    //--------------------
    //traverse descendants
    //--------------------

    //indent info
    let nextIndex = 0;
    let currentIndent = 0;
    let indentInfo = [];

    //list range info
    let activeParentNode = [];
    activeParentNode.push(listNode);
    let activeListRangeInfo = [];
    let listRangeInfo = [];
    let initialRangeEntry = {node: listNode, startIndex: 0, startPos: mainStartPos};
    activeListRangeInfo.push(initialRangeEntry);
    listRangeInfo.push(initialRangeEntry);

    //construction function
    let constructIndentInfo = (node,offset,parent) => {
        let pos = mainStartPos + 1 + offset;

        //get the proper parent entry
        let listRangeEntry;
        while(true) {
            listRangeEntry = activeListRangeInfo[activeListRangeInfo.length-1];
            if(listRangeEntry.node != parent) {
                listRangeEntry.endPos = pos;
                listRangeEntry.endIndex = nextIndex - 1;
                if(activeListRangeInfo.length > 0) {
                    activeListRangeInfo.pop();
                    currentIndent--;
                }
                else throw new Error("Unknown error indenting!");
            }
            else {
                break;
            }
        } 

        //record the indent, by line
        if(node.type == schema.nodes.listItem) {
            let indentEntry = {};
            indentEntry.indent = currentIndent;
            indentEntry.startPos = pos;
            indentEntry.index = nextIndex++;
            
            //see if we are in the selection
            if((pos + node.nodeSize >= $from.pos)&&(pos <= $to.pos)) {
                indentEntry.delta = 1;
            }

            indentInfo.push(indentEntry);
            return false;
        }
        else if(node.type.spec.group == "list") {
            listRangeEntry = {node: node, startIndex: nextIndex, startPos: pos};
            listRangeInfo.push(listRangeEntry);
            activeListRangeInfo.push(listRangeEntry);
            currentIndent++;
            return true;
        }
    }

    listNode.descendants(constructIndentInfo);

    //finishe the list
    let mainInsideEndPos = mainStartPos + listNode.nodeSize - 1;
    let endIndex = nextIndex - 1;
    while(activeListRangeInfo.length > 0) {
        let listRangeEntry = activeListRangeInfo.pop();
        listRangeEntry.endPos = mainInsideEndPos;
        listRangeEntry.endIndex = endIndex;
    }

    //--------------------------
    //testing
    //--------------------------

    let listRanges = [];
    let activeListRanges = [];
    let previousIndentEntry;
    indentInfo.forEach( currentIndentEntry => {
        if(previousIndentEntry) {
            if(currentIndentEntry.indent > previousIndentEntry.indent) {
                //add a list, or multiple (indent)
                for(let indent = previousIndentEntry.indent + 1; indent <= currentIndentEntry.indent; indent++) {
                    let listRangeEntry = {}
                    listRangeEntry.startPos = currentIndentEntry.startPos;
                    listRangeEntry.startIndex = currentIndentEntry.index;
                    listRangeEntry.indent = indent;
                    listRanges.push(listRangeEntry);
                    activeListRanges.push(listRangeEntry);
                }
            }
            else if(currentIndentEntry.indent < previousIndentEntry.indent) {
                //remove a list,or multiple (unindent)
                for(let indent = previousIndentEntry.indent - 1; indent >= currentIndentEntry.indent; indent--) {
                    if(activeListRanges.length === 0) throw new Error("Unknown error constructing indented lists");
                    let closeRangeEntry = activeListRanges.pop();
                    closeRangeEntry.endPos = currentIndentEntry.startPos;
                    closeRangeEntry.endIndex = currentIndentEntry.index - 1;
                }
            }
        }
        previousIndentEntry = currentIndentEntry;
    });

    //finish up
    while(activeListRanges.length > 0) {
        let rangeEntry = activeListRanges.pop();
        rangeEntry.endPos = mainInsideEndPos;
        rangeEntry.endIndex = endIndex;
    }

    console.log("Indent info: " + JSON.stringify(indentInfo))
    let modListRangeInfo = listRangeInfo.map( entry => {
        return {startIndex:entry.startIndex, startPos:entry.startPos, endIndex:entry.endIndex, endPos:entry.endPos};
    });
    console.log("List Range info: " + JSON.stringify(modListRangeInfo))
    console.log("Measured List Range: " + JSON.stringify(listRanges))

    //The two ranges differ because the start is on the list versus the item?
    //That doesn't matter for now. We will compare based on start and end index values.

}

export function unindentSelection(state, dispatch) {

}
 

//==========================
// Common utilities
//==========================

/** Split any lists so there is not a list that spans outside the current selection */
function splitStartAndEndLists(transform,selection) {
    //this is our range to convert
    let { $from, $to } = selection;
    transform = splitSpannedListAfterPos($to, transform);
    transform = splitSpannedListBeforePos($from, transform);
    return transform;
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




//###########################################################################################################
//OLD 
// export function OLDconvertToNonListBlockType(nodeType, state, dispatch) {
//     //this will be our transform
//     let transform = state.tr;

//     //this is our range to convert
//     let { $from, $to } = state.selection;

//     let schema = state.schema;

//     //---------------------------
//     //Split any lists so there is not a list that spans outside the current selection
//     //Do after first so this doesn't change the value of $from yet.
//     //---------------------------
//     transform = splitSpannedListAfterPos($to, transform);
//     transform = splitSpannedListBeforePos($from, transform);

//     //update if we did any transform
//     if (transform.docChanged) {
//         let newFrom = transform.mapping.map($from.pos);
//         let newTo = transform.mapping.map($to.pos);
//         $from = transform.doc.resolve(newFrom);
//         $to = transform.doc.resolve(newTo);
//     }

//     //------------------------------
//     // Add the worker parent
//     //------------------------------

//     {
//         let parentDepth = 0;
//         let nodeType = schema.nodes.workerParent;
//         transform = wrapSelectionInNode($from, $to, parentDepth, nodeType, transform)
//     }

//     //-------------------------------
//     // lift out of any lists!
//     //-------------------------------

//     //we will list one list per iteration, and keep doing this until there are no more lists
//     let listInfo;
//     do {
//         let startGeneration = 0;

//         //grab the worker node
//         let { workerNode, workerContentStart } = getWorkerInfo(transform.doc,schema);
//         listInfo = findContainedList(workerNode, workerContentStart, startGeneration);

//         if (listInfo) {
//             //remove list if one is found
//             let $listContentsFrom = transform.doc.resolve(listInfo.contentsStart);
//             let $listContentsTo = transform.doc.resolve(listInfo.contentsEnd);
//             let listDepth = listInfo.listGeneration + 1;
//             transform = liftContent($listContentsFrom, $listContentsTo, listDepth, transform);
//         }
//     } while (listInfo)

//     //-------------------------------
//     // convert the text blocks to the specified type
//     // (there should only be text blocks)
//     //-------------------------------

//     {
//         //get the content range for the worker node
//         let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);

//         transform = transform.setBlockType(workerContentStart, workerContentEnd, nodeType);
//     }

//     //------------------------------
//     // lift out of the worker
//     //------------------------------

//     {
//         //get the content range for the worker node
//         let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);
//         let $workerContentStart = transform.doc.resolve(workerContentStart);
//         let $workerContentEnd = transform.doc.resolve(workerContentEnd);

//         let workerDepth = 1;
//         transform = liftContent($workerContentStart, $workerContentEnd, workerDepth, transform);
//     }

//     //------------------------------
//     // execute the transform
//     //------------------------------

//     if ((dispatch) && (transform.docChanged)) {
//         dispatch(transform);
//     }
// }


// export function OLDconvertToListBlockType(nodeType, state, dispatch) {
//     //this will be our transform
//     let transform = state.tr;

//     //this is our range to convert
//     let { $from, $to } = state.selection;

//     let schema = state.schema;

//     //---------------------------
//     //Split any lists so there is not a list that spans outside the current selection
//     //Do after first so this doesn't change the value of $from yet.
//     //---------------------------
//     transform = splitSpannedListAfterPos($to, transform);
//     transform = splitSpannedListBeforePos($from, transform);

//     //update if we did any transform
//     if (transform.docChanged) {
//         let newFrom = transform.mapping.map($from.pos);
//         let newTo = transform.mapping.map($to.pos);
//         $from = transform.doc.resolve(newFrom);
//         $to = transform.doc.resolve(newTo);
//     }

//     //------------------------------
//     // Add the worker parent
//     //------------------------------

//     {
//         let parentDepth = 0;
//         let nodeType = schema.nodes.workerParent;
//         transform = wrapSelectionInNode($from, $to, parentDepth, nodeType, transform)
//     }

//     //-------------------------------
//     // lift out of any lists at the ROOT level (children will remain as child lists - but we must reset their type, below.)
//     //-------------------------------

//     {
//         //get the top level lists
//         //grab the worker node
//         let { workerNode, workerContentStart } = getWorkerInfo(transform.doc,schema);

//         let doRecursive = false;
//         let startGeneration = 0;
//         let listInfos = getContainedLists(workerNode, workerContentStart, startGeneration, doRecursive);

//         //go through top level lists in reverse order and lift out of them (so we don't have to worry about position changes here)
//         for (let i = listInfos.length - 1; i >= 0; i--) {
//             let listInfo = listInfos[i];

//             //remove list if one is found
//             let $listContentsFrom = transform.doc.resolve(listInfo.contentsStart);
//             let $listContentsTo = transform.doc.resolve(listInfo.contentsEnd);
//             let listDepth = listInfo.listGeneration + 1;
//             transform = liftContent($listContentsFrom, $listContentsTo, listDepth, transform);
//         }

//     }

//     //-------------------------------
//     // make any remaining child lists the proper list type
//     //-------------------------------

//     {
//         //get the top level lists
//         //grab the worker node
//         let { workerNode, workerContentStart } = getWorkerInfo(transform.doc,schema);

//         let doRecursive = true;
//         let startGeneration = 0;
//         let listInfos = getContainedLists(workerNode, workerContentStart, startGeneration, doRecursive);

//         //go through top level lists in reverse order and lift out of them (so we don't have to worry about position changes here)
//         for (let i = 0; i < listInfos.length; i++) {
//             let listInfo = listInfos[i];

//             //change the child list type if it does not match the current type
//             if (listInfo.node.nodeType != nodeType) {
//                 let listNode = listInfo.node;
//                 let listOutsideFrom = listInfo.contentsStart - 1;
//                 let listOutsideTo = listInfo.contentsEnd + 1;
//                 transform = setNodeType(listNode, listOutsideFrom, listOutsideTo, nodeType, transform);
//             }
//         }

//     }

//     //-------------------------------
//     // convert the text blocks to list items
//     //-------------------------------

//     {
//         //get the content range for the worker node
//         let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);

//         transform = transform.setBlockType(workerContentStart, workerContentEnd, schema.nodes.listItem);
//     }

//     //------------------------------
//     // wrap all the items in a list
//     //------------------------------
//     {
//         //get the worker node range
//         let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);
//         let $workerContentStart = transform.doc.resolve(workerContentStart);
//         let $workerContentEnd = transform.doc.resolve(workerContentEnd);

//         let parentDepth = 1;
//         transform = wrapSelectionInNode($workerContentStart, $workerContentEnd, parentDepth, nodeType, transform)
//     }

//     //------------------------------
//     // lift out of the worker
//     //------------------------------

//     //  let workerIndex;

//     {
//         //get the content range for the worker node
//         let { workerContentStart, workerContentEnd } = getWorkerInfo(transform.doc,schema);
//         let $workerContentStart = transform.doc.resolve(workerContentStart);
//         let $workerContentEnd = transform.doc.resolve(workerContentEnd);

//         //get the index of the worker before we remove it
//         // {
//         //   let parentDepth = 0;
//         //   workerIndex = getNodeIndex($workerContentStart,parentDepth);
//         // }

//         let workerDepth = 1;
//         transform = liftContent($workerContentStart, $workerContentEnd, workerDepth, transform);
//     }

//     //------------------------------
//     // Check if there is a list of the same type before and after the updated selection. If so, join them.
//     //------------------------------

//     {
//         //if the node before or after our new list is a list of the same type, it should be joined.
//         //note we will also want to join common generation child lists...
//     }

//     //------------------------------
//     // execute the transform
//     //------------------------------

//     if ((dispatch) && (transform.docChanged)) {
//         dispatch(transform);
//     }

// }


// /** This finds the worker nodes in the doc. This will throw an error if there
//  * is not a single worker node. */
// function getWorkerInfo(doc,schema) {
//     let workerNodeInfo;
//     doc.forEach((node, offset) => {
//         if (node.type == schema.nodes.workerParent) {
//             if (workerNodeInfo !== undefined) throw new Error("Multiple worker nodes found!");

//             workerNodeInfo = {};
//             workerNodeInfo.workerNode = node;
//             workerNodeInfo.workerContentStart = offset + 1;
//             workerNodeInfo.workerContentEnd = workerNodeInfo.workerContentStart + node.content.size;
//         }
//     });
//     if (workerNodeInfo === undefined) throw new Error("No worker nodes found!");
//     return workerNodeInfo;
// }

// /** This function returns list info for a list contained in the given list. If the recursive 
//  * flag is false it only returns list info for direct children. Otherwise it also returns further descendant lists, first.
//  */
// function findContainedList(parentNode, parentInsidePosition, parentListGeneration) {
//     let listInfo;
//     let position = parentInsidePosition;
//     for (let i = 0; (i < parentNode.childCount) && (!listInfo); i++) {
//         let childNode = parentNode.child(i);
//         listInfo = getListInfo(childNode, position, parentListGeneration);

//         //update position for the next node
//         position += childNode.nodeSize;
//     }
//     return listInfo;
// }

// /** This function returns list info if this is a list node. If the recusrive flag is set,
//  * it will return list info for a child list if there are any. */
// //helper
// function getListInfo(node, outsidePosition, parentListGeneration) {
//     let listInfo;

//     if (node.type.spec.group == "list") {
//         //list found
//         let currentListGeneration = parentListGeneration + 1;
//         let currentListInsidePosition = outsidePosition + 1;

//         //check for a child list
//         listInfo = findContainedList(node, currentListInsidePosition, currentListGeneration);

//         if (listInfo === undefined) {
//             //set the list info for this list if no child found
//             listInfo = {};
//             listInfo.node = node;
//             listInfo.contentsStart = currentListInsidePosition
//             listInfo.contentsEnd = listInfo.contentsStart + node.content.size;
//             listInfo.listGeneration = currentListGeneration;
//         }
//     }

//     return listInfo;
// }

// function getContainedLists(parentNode, parentInsidePosition, parentListGeneration, doRecursive) {
//     let listInfos = [];
//     let position = parentInsidePosition;
//     for (let i = 0; i < parentNode.childCount; i++) {
//         let childNode = parentNode.child(i);
//         let childListInfos = getAllListInfos(childNode, position, parentListGeneration, doRecursive);
//         listInfos = listInfos.concat(childListInfos);

//         //update position for the next node
//         position += childNode.nodeSize;
//     }

//     return listInfos;
// }

// /** This function returns list info if this is a list node. If the recusrive flag is set,
//  * it will return list info for a child list if there are any. */
// //helper
// function getAllListInfos(node, outsidePosition, parentListGeneration, doRecursive) {
//     let listInfos = [];

//     if (node.type.spec.group == "list") {
//         //list found
//         let currentListGeneration = parentListGeneration + 1;
//         let currentListInsidePosition = outsidePosition + 1;

//         //add the child lists
//         if (doRecursive) {
//             let childListInfos = getContainedLists(node, currentListInsidePosition, currentListGeneration, doRecursive);
//             listInfos = listInfos.concat(childListInfos);
//         }

//         //add the current list info
//         let listInfo = {};
//         listInfo.node = node;
//         listInfo.contentsStart = currentListInsidePosition
//         listInfo.contentsEnd = listInfo.contentsStart + node.content.size;
//         listInfo.listGeneration = currentListGeneration;

//         listInfos.push(listInfo);
//     }

//     return listInfos;
// }

// /** This function lifts the content at the given positions. It returns
//  * the updated transform */
// function liftContent($contentStart, $contentEnd, parentDepth, transform) {
//     let range = new NodeRange($contentStart, $contentEnd, parentDepth);
//     return transform.lift(range, parentDepth - 1);
// }

// /** This changes the node type. It assumes the node type is valid. */
// function setNodeType(node, outsideFromPos, outsideToPos, nodeType, transform) {
//     transform.step(new ReplaceAroundStep(outsideFromPos, outsideToPos, outsideFromPos + 1, outsideToPos - 1,
//         new Slice(Fragment.from(nodeType.create(null, null, node.marks)), 0, 0), 1, true));
//     return transform;
// }

/** This reads the path associated with the input position to find the index of the node at the requested depth. */
  // function getNodeIndex($pos,parentDepth) {
  //   let nodeIndexArrayIndex = parentDepth*3 + 1;
  //   if($pos.path.length <= nodeIndexArrayIndex) throw new Exception("Error reading the node index - position depth to small!");
  //   return $pos.path[nodeIndexArrayIndex];
  // }

//end old
//#############################################################################################

