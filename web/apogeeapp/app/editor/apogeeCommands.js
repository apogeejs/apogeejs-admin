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
    transform = splitStartAndEndLists(transform,selection,schema);

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
    flattenList(node,nodeRefStart,transform,refStep,true);

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
    transform = splitStartAndEndLists(transform,state.selection,schema);

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
    let listEndPosition = baseListPosition + 1 + listNode.content.size;

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
    addListIndent(nodeType,indentInfo,listEndPosition,transform,refStep) 
    
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
    return doIndentChange(1, state, dispatch);
}

export function unindentSelection(state, dispatch) {
    return doIndentChange(-1, state, dispatch);
}

function doIndentChange(indentDelta, state, dispatch) {
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
    let mainInsidePos = $from.start(1);
    let mainOutsidePos = mainInsidePos - 1;
    let mainInsideEndPos = mainInsidePos + startTopNode.content.size;
    let mainIndex = $from.index(0);

    //require we are in a single list item
    if((startTopNode.type.spec.group != "list")||(startTopNode != endTopNode)) return false;
    let listNode = startTopNode;

    //--------------------
    //traverse descendants
    //--------------------

    //indent info
    let currentIndent = 0;
    let indentInfo = [];

    //list range info
    let activeParentStack = [];
    activeParentStack.push(listNode);
    let activeParent;

    //construction function
    let constructIndentInfo = (node,offset,parent) => {
        let outsideNodeStart = mainInsidePos + offset;

        //get the proper parent entry
        while(true) {
            activeParent = activeParentStack[activeParentStack.length-1];
            if(activeParent != parent) {
                if(activeParentStack.length > 0) {
                    activeParentStack.pop();
                    currentIndent--;
                }
                else {
                    throw new Error("Unknown error indenting!");
                }
            }
            else {
                break;
            }
        } 

        //record the indent, by line
        if(node.type == schema.nodes.listItem) {
            let indentEntry = {};
            indentEntry.indent = currentIndent;
            
            //see if we are in the selection - we start befroe the end of the node inside
            //and end after the start of the node inside
            if(($from.pos <= outsideNodeStart + 1 + node.nodeSize)&&($to.pos >= outsideNodeStart + 1)) {
                let maybeNewIndent = indentEntry.indent + indentDelta;
                //don't unindent from indent = 0
                if(maybeNewIndent >= 0) {
                    indentEntry.indent = maybeNewIndent;
                }
            }

            indentInfo.push(indentEntry);
            return false;
        }
        else if(node.type.spec.group == "list") {
            activeParentStack.push(node);
            currentIndent++;
            return true;
        }
    }

    //execute function on list node descendants
    listNode.descendants(constructIndentInfo);

    //--------------------------
    // Flatten the list
    //--------------------------
    flattenList(listNode,mainOutsidePos,transform,refStep,true);

    //--------------------------
    // Set element locations on indent info (now that we flattened the list)
    //--------------------------
    let mapping = transform.mapping.slice(refStep);
    let newListPos = mapping.map(mainOutsidePos);
    let newListInsideEndPos = mapping.map(mainInsideEndPos);
    
    let newRefDoc = transform.doc;
    let newRefStep = transform.steps.length;
    let newListNode = newRefDoc.child(mainIndex);

    newListNode.forEach( (childNode,offset,index) => {
        let indentInfoEntry = indentInfo[index];
        indentInfoEntry.nodeStart = newListPos + 1 + offset;
    })

    //--------------------------
    // Add the proper indent
    //--------------------------
    addListIndent(newListNode.type,indentInfo,newListInsideEndPos,transform,newRefStep);

    //------------------------------
    // execute the transform
    //------------------------------

    if ((dispatch) && (transform.docChanged)) {
        dispatch(transform);
    }

    return true;

}

//==========================
// Common utilities
//==========================

/** Split any lists so there is not a list that spans outside the current selection */
function splitStartAndEndLists(transform,selection,schema) {
    //this is our range to convert
    let { $from, $to } = selection;
    transform = splitSpannedListAfterPos($to, transform, schema);
    transform = splitSpannedListBeforePos($from, transform, schema);
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

/** This is a recursive function to flatten a list. The argument flattenOnlyChildren can
 * be set so the current passed list object is not flattened
 */
function flattenList(node,nodeRefStart,transform,refStep,flattenOnlyChildren) {
    //unwrap the children
    node.forEach( (childNode,offset,index) => {
        let refPosition = nodeRefStart + 1 + offset;
        if(childNode.type.spec.group == "list") {
            flattenList(childNode,refPosition,transform,refStep,false);
        }
    });

    //unwrap this list, including adding a tab for any indents
    if(!flattenOnlyChildren) {
        unwrapChildren(node,nodeRefStart,transform,refStep);
    }
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

/** This function takes a indentInfo structure to tell where to indent a given list. The
 * list should be a flat list (no existing indent). The indent info should contain the nodeStart postiion, relative to the document at
 * the refStep, and the amount of indent for that line. */
function addListIndent(nodeType,indentInfo,listInsideEndPos,transform,refStep) {

    //calculate the desired list ranges from the indent info
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

    //finishe the list
    while(activeListRanges.length > 0) {
        let listRangeEntry = activeListRanges.pop();
        listRangeEntry.endPos = listInsideEndPos;
    }

    // insert the list nodes for indenting
    listRanges.forEach( listRangeEntry => {
        let listParentDepth = listRangeEntry.indent;
        wrapSelectionInNode(listRangeEntry.startPos, listRangeEntry.endPos, listParentDepth, nodeType, transform, refStep);
    });
    
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

