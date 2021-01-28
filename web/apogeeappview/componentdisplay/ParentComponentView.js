import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import { createProseMirrorManager } from "/apogeeappview/componentdisplay/proseMirrorSetup.js";

import { TextSelection, NodeSelection, EditorState, Selection } from "/prosemirror/dist/prosemirror-state.es.js";
import { Slice } from "/prosemirror/dist/prosemirror-model.es.js"
import { GapSelection } from "/apogeeappview/editor/selection/GapSelection.js";

//this constant is used (or hopefully not) in correctCreateInfoforRepeatedNames
const MAX_SUFFIX_INDEX = 99999;

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponentView extends ComponentView {

    constructor(appViewInterface,component) {
        //base constructor
        super(appViewInterface,component);

        //ccreate the editor manager
        this.editorManager = createProseMirrorManager(this.getApp(),component.getSchema());
    }

    createTreeDisplay() {
        var treeDisplay = super.createTreeDisplay();
        
        //add any existing children to the tree entry
        var treeEntry = treeDisplay.getTreeEntry();
        var parentFolder = this.component.getParentFolderForChildren();
        var appViewInterface = this.getAppViewInterface();
        var childIdMap = parentFolder.getChildIdMap();
        for(var childKey in childIdMap) {
            var childMemberId = childIdMap[childKey];
            var childComponentView = appViewInterface.getComponentViewByMemberId(childMemberId);
            if(childComponentView) {
                var childTreeEntry = childComponentView.getTreeEntry();
                treeEntry.addChild(childTreeEntry);
            }
        }
        
        return treeDisplay;
    }
    
    //----------------------
    // Parent Methods
    //----------------------

    /** This function adds a fhile componeent to the displays for this parent component. */
    removeChild(childComponentView) {
        //remove from tree entry
        var treeEntry = this.getTreeEntry();
        if(treeEntry) {
            var childTreeEntry = childComponentView.getTreeEntry();
            if(childTreeEntry) {
                treeEntry.removeChild(childTreeEntry);
            }
        }

        if(this.tabDisplay) {
            this.tabDisplay.removeChild(childComponentView); 
        }
        
        //remove child windows - just hide them. They will be deleted in the component
        childComponentView.closeComponentDisplay();
    }

    /** This function adds a fhile componeent to the displays for this parent component. */
    addChild(childComponentView) {
        //add the child to the tree entry
        var treeEntry = this.getTreeEntry();
        if(treeEntry) {
            var childTreeEntry = childComponentView.getTreeEntry();
            treeEntry.addChild(childTreeEntry);
        }

        //add child entry for tab
        if(this.tabDisplay) {
            this.tabDisplay.addChild(childComponentView); 
        }
    }


    //###########################################################################################################
    //start page code
    
    getEditorState() {
        return this.getComponent().getEditorState();
    }

    getEditorManager() {
        return this.editorManager;
    }

    getSchema() {
        return this.getComponent().getSchema();
    }

    //----------------------------------------
    // Editor Command Processing
    //----------------------------------------

    /** This function turns a transaction into an application command. This is used
     * for the command path for commands generated outside the editor. */
    createEditorCommand(transaction,optionalInitialSelection,optionalInitialMarks) {

        var commandData = {};
        commandData.type = "literatePageTransaction";
        commandData.componentId = this.getComponent().getId();

        //we include the transaction because that is how prose mirror modiies state
        //it will be deleted from any command saved in the history so there is only JSON objects left.
        //If a command from history is used, the transaction will be reconstructed from the history.
        commandData.transaction = transaction;

        //the initial selection and marks should be included if this is a document changing transaction, 
        //they are used to make the undo command.
        if(optionalInitialSelection) commandData.initialSelection = optionalInitialSelection.toJSON();
        if(optionalInitialMarks) commandData.initialMarks = optionalInitialMarks.map(mark => mark.toJSON());
            
        return commandData;
    }

    
    /** This method is called to respond to transactions created in the editor. */
    applyTransaction(transaction) {
        
        let editorState = this.getEditorState();

        //this will hold the resulting command
        let apogeeCommand;
        let commandsDeleteComponent = false;
        let deleteMsg;

        let initialSelection = editorState.selection;
        let initialMarks = editorState.marks;

        if(this.transactionUpdatesModel(transaction)) {

            let commandList = [];
            let allDeletedNames = [];

            //record if the transaction sets the selection or markSet
            let finalSelection = transaction.selectionSet ? transaction.selection : null;
            let finalStoredMarks = transaction.storedMarksSet ? transaction.storedMarks : null;

            let workingInitialSelection = initialSelection;
            let workingInitialMarks = initialMarks;

            //-----------------------------------------
            //process each step, looking for inserted or deleted apogee nodes
            //if there are any, intercept these commands and modify them to do the proper
            //actions on the model and update the transaction so the apogee components 
            //are created/deleted at the proper time relative to their insert/remove from the document.
            //-------------------------------------------
            let activeNameMap = this.createActiveNameMap();
            let modifiedTransaction = editorState.tr;
            let transactionModified = false;
            transaction.steps.forEach( (oldStep, index) => {

                let oldStepDoc = transaction.docs[index];

                //--------------------------------------
                //process the step for deleted components
                //--------------------------------------
                let deleteComponentCommands;
                let deletedComponentShortNames = this.getStepDeletedComponentShortNames(oldStep,oldStepDoc);
                if(deletedComponentShortNames.length > 0) {
                    //update active name map
                    this.updateActiveNameMapForDelete(activeNameMap,deletedComponentShortNames);

                    //get delete commands
                    deleteComponentCommands = this.createDeleteComponentCommands(deletedComponentShortNames);

                    //save the deleted names so we can warn the user about the delete
                    allDeletedNames = allDeletedNames.concat(deletedComponentShortNames);
                }

                //--------------------------------------
                //process the step for any added components including potentially modifying the slice
                //--------------------------------------
                let createComponentCommands;
                let { insertSlice, createdComponentInfos } = this.processForStepComponentCreateCommands(oldStep,activeNameMap);
                if(createdComponentInfos.length > 0) {
                    //get the create commands
                    createComponentCommands = this.createCreateComponentCommands(createdComponentInfos);

                    //perhaps confusingly, the activeNameMap is updated in place in the above function so we don't have to 
                    //do it here.
                }

                //--------------------------------------
                // Update the new transaction and commands if an apogee nodes are created and/or deleted
                //--------------------------------------
                if((deleteComponentCommands)||(createComponentCommands)) {
                    //we want to modify the step and insert the delete and/or create component commands

                    //right now we are assuming and only supporting the case that the command that creates or
                    //deleted components is a REPLACE step (not a REPLACE AROUND or anything else)
                    if(oldStep.jsonID != "replace") {
                        throw new Error("Component add/remove in a non-replace step: " + oldStep.jsonID + "; NOT CURRRENTLY SUPPORTED!");
                    }

                    //----------------------------------
                    //create the remove step (if needed)
                    //-----------------------------------
                    //this is the range in which we wil insert the new content
                    let insertFrom = oldStep.from;
                    let insertTo;

                    //if there is content removed, do this in an explicit delete step and, if needed, a later insert after any components are created/deleted
                    if(oldStep.from != oldStep.to) {
                        //store the initial modified step count
                        let initialStepCount = modifiedTransaction.steps.length;

                        //rather than replacing the content including the new apogee node, just DELETE for now.
                        //we must delete issue a create component command before we insert it into the doc.
                        modifiedTransaction.deleteRange(oldStep.from,oldStep.to);
                        transactionModified = true;

                        //we want to look at the steps we created, so we can update these with our new content
                        //for now we will support only one replace step is created.
                        let addedRemoveSliceLength = 0;
                        let newStepCount = modifiedTransaction.steps.length;
                        if(newStepCount - initialStepCount != 1) {
                            let addedStep = modifiedTransaction.steps[newStepCount-1];
                            if((addedStep.slice)&&(addedStep.slice.content)) {
                                addedRemoveSliceLength = addedStep.slice.content.size;
                            }
                        }

                        insertTo = oldStep.from + addedRemoveSliceLength;
                    }
                    else {
                        insertTo = oldStep.from;
                    }

                    //close out the old transaction if needed, starting a new one
                    if(transactionModified) {
                        //save the transaction as a command (so we can add the model commands now)
                        let editorCommand = this.createEditorCommand(modifiedTransaction,workingInitialSelection,workingInitialMarks);
                        commandList.push(editorCommand);

                        //create a new transaction
                        let config = {};
                        config.doc = modifiedTransaction.doc;
                        config.selection = modifiedTransaction.selection;
                        config.storedMarks = modifiedTransaction.storedMarks;
                        let intermediateState = EditorState.create(config);

                        modifiedTransaction = intermediateState.tr;
                        workingInitialSelection = config.selection;
                        workingInitialMarks = config.storedMarks;
                        transactionModified = false;
                    }

                    //----------------------------
                    //insert any model commands
                    //----------------------------
                    if(deleteComponentCommands) commandList.push(...deleteComponentCommands);
                    if(createComponentCommands) commandList.push(...createComponentCommands);

                    //----------------------------
                    //create the editor insert step (if needed)
                    //----------------------------
                    if(insertSlice) {
                        modifiedTransaction.replaceRange(insertFrom,insertTo,insertSlice);
                        transactionModified = true;
                    }    
                }
                else {
                    //add the old step to the current modified transaction
                    modifiedTransaction.step(oldStep);
                }

            })

            //if the selection or stored marks was explicitly set in the transaction, add these back to the final new transaction
            if(finalSelection) {
                let fixedSelection = this.convertSelectionToNewDoc(finalSelection,modifiedTransaction.doc);
                modifiedTransaction.setSelection(fixedSelection);
                transactionModified = true;
            }
            if(finalStoredMarks) {
                modifiedTransaction.setStoredMarks(finalStoredMarks);
                transactionModified = true;
            }

            //close out the final transaction, if needed
            if(transactionModified) {
                //make sure we scroll into view
//TEST:CHANGE SCROLL INTO VIEW
//                    modifiedTransaction.scrollIntoView();

                //save the transaction as a command (so we can add the model commands now)
                let editorCommand = this.createEditorCommand(modifiedTransaction,workingInitialSelection,workingInitialMarks);
                commandList.push(editorCommand);
            }

            //-------------------
            // Get verificaion if we are deleting anything
            //-------------------
            if(allDeletedNames.length > 0) {
                //flag a delete will be done
                commandsDeleteComponent = true
                deleteMsg = "This action will delete the selected cells. Are you sure you want to do that? Cells to delete: " + allDeletedNames;
            }

            //-------------------------
            //create the apogee command for the input transaction
            //-------------------------
            apogeeCommand = {};
            apogeeCommand.type = "compoundCommand";
            apogeeCommand.childCommands = commandList;
        }
        else {
            //--------------------------
            //There is no change to the model. Convert the transaction directly to an editor command
            //--------------------------
            apogeeCommand = this.createEditorCommand(transaction,initialSelection,initialMarks);
        }

        //-------------------
        //execute the command
        //-------------------
        if(apogeeCommand) {

            let doAction = () => {
                this.getApp().executeCommand(apogeeCommand);
            }

            if(commandsDeleteComponent) {
                let okAction = () => {
                    doAction();
                    this.giveEditorFocusIfShowing();
                }
                //if there is a delete, verify the user wants to do this
                let cancelAction = () => {
                    this.giveEditorFocusIfShowing();
                };
                apogeeUserConfirm(deleteMsg,"Delete","Cancel",doAction,cancelAction);
            }
            else {
                //otherwise just take the action
                doAction();
            }
        }
    }

    //---------------------------------------
    // Transaction Processing to extract model commands
    //---------------------------------------

    /** This function checks if the editor transaction creates or deletes any apogee components. */
    transactionUpdatesModel(transaction) {

        if(!transaction.docChanged) return false;

        let modelUpdated = false;

        //check for deleted components
        let deleteNodeComponentCheck = node => {
            if(node.type.name == "apogeeComponent") modelUpdated = true;

            //apogee nodes are top level. Return false so we do no dive into child nodes.
            //if we change this rule, we need to change this code.
            return false;
        }

        //check steps to see if model is updated
        transaction.steps.forEach( (step,index) => {

            //look for deleted components in removed nodes 
            let doc = transaction.docs[index];
            if(step.jsonID == "replace") {
                doc.nodesBetween(step.from,step.to,deleteNodeComponentCheck);
            }
            else if(step.jsonID == "replaceAround") {
                doc.nodesBetween(step.from,step.gapFrom,deleteNodeComponentCheck);
                doc.nodesBetween(step.gapTo,step.to,deleteNodeComponentCheck);
            }

            //look for created components in added nodes
            if(this.stepHasCreateComponentNode(step)) modelUpdated = true;
        });

        return modelUpdated;
    }

    /** This function creates a map of the component names currently in this parent component. */
    createActiveNameMap() {
        //retrieve the existing names
        let activeNameMap = {};
        let member = this.getComponent().getMember();
        for(let name in member.getChildIdMap()) {
            activeNameMap[name] = true;
        }

        return activeNameMap;
    }
    
    /** This function updates the active name map for the list of deleted components. If updates the map in place, but also returns it. */
    updateActiveNameMapForDelete(activeNameMap,deletedComponentShortNames) {
        deletedComponentShortNames.forEach( name => {
            if(activeNameMap[name]) delete activeNameMap[name];
        })
    }

    /** This function gets the shorts names for the components deleted in this step. */
    getStepDeletedComponentShortNames(step,stepDoc) {
        let deletedComponentShortNames = [];

        //this will store the name if this is a component node
        let getApogeeNodeNames = node => {
            if(node.type.name == "apogeeComponent") {
                deletedComponentShortNames.push(node.attrs.name);
            }
        }

        //read the deleted nodes, saving the apogee component node names
        if(step.jsonID == "replace") {
            stepDoc.nodesBetween(step.from,step.to,getApogeeNodeNames);
        }
        else if(step.jsonID == "replaceAround") {
            stepDoc.nodesBetween(step.from,step.gapFrom,getApogeeNodeNames);
            stepDoc.nodesBetween(step.gapTo,step.to,getApogeeNodeNames);
        }

        return deletedComponentShortNames;
    }
    
    /** This method process the step, modifying it as needed:
     * -it pulls out the "state" that we include in the pasted data, but we don't track this value in the working node
     * - it checks if the name is available. If not, it modifying the name.
     * The passed in variable "activeNameMap" is modified in place as new names are added
     */
    //let { insertSlice, createdComponentInfos } = this.processForStepComponentCreateCommands(oldStep,oldStepJson,activeNameMap);
    processForStepComponentCreateCommands(oldStep,activeNameMap) {
        let insertSlice;
        let createdComponentInfos = [];

        if(!this.stepHasCreateComponentNode(oldStep)) {
            //no modified step or create component commands needed
            insertSlice = oldStep.slice;
            createdComponentInfos = [];
        }
        else {
            //we will check each apogee node to see if we need to change the name of any of them
            //it might be a little cumbersome how I do this.
            let newSliceContentJson = [];
            let oldStepJson = oldStep.toJSON();
            if(oldStepJson.stepType == "replace"){
                oldStepJson.slice.content.forEach( oldNodeJson => {

                    if(oldNodeJson.type == "apogeeComponent") {
                        let newNodeJson = apogeeutil.jsonCopy(oldNodeJson);

                        //remove the state from the json, but save it separately
                        let state = newNodeJson.attrs.state;
                        delete newNodeJson.attrs.state;

                        //get the name and do any needed name processing
                        let requestedName = newNodeJson.attrs.name;

                        let nameToUse = this.createComponentReplacementNameProcessing(requestedName,activeNameMap);
                        if(nameToUse != requestedName) {
                            newNodeJson.attrs.name = nameToUse;

                            //we need to change the name in the state too
                           if(state) {
                                state.memberJson.name = nameToUse;                                
                            }
                        }

                        //store the create info
                        let createdComponentInfo = {};
                        createdComponentInfo.name = nameToUse;
                        createdComponentInfo.state = state;
                        createdComponentInfos.push(createdComponentInfo);

                        //store the modified json
                        newSliceContentJson.push(newNodeJson);
                        
                    }
                    else {
                        //not a component, store the original node
                        newSliceContentJson.push(oldNodeJson);
                    }
                })
            }
            else {
                //we are assuming this will be a replace, and we will not currently support otherwise
            }

            let newSliceJson = {};
            Object.assign(newSliceJson,oldStepJson.slice);
            newSliceJson.content = newSliceContentJson;
            insertSlice = Slice.fromJSON(this.getSchema(),newSliceJson);
        }

        

        //return the new step
        return { insertSlice, createdComponentInfos };
    }

    /** This method checks the name of a created component and returns the proper name to 
     * use to create the component. It will be modified if the name already exists. This function modifies the active name map 
     * in place. */
    createComponentReplacementNameProcessing(name,activeNameMap) {
        if(activeNameMap[name]) {
            //repeat name! - modify it with a suffix
            for(let suffixIndex = 1; true; suffixIndex++) {
                let testName = name + "_" + suffixIndex;
                if(!activeNameMap[testName]) {
                    let newName = testName;
                    //mark this name as used
                    activeNameMap[newName] = true;
                    return newName;
                }
                
                //I assume this will never happen, but just in case we will provide an end to this loop
                if(suffixIndex > MAX_SUFFIX_INDEX) {
                    throw new Error("Too many repeat names in create new component!");
                }
            }
        }
        else {
            //old name was good, mark it as used
            activeNameMap[name] = true;
            return name
        }
    }

    /** This method returns true if the given step has any create component node command. */
    stepHasCreateComponentNode(step) {
        if((step.jsonID == "replace")||(step.jsonID == "replaceAround")) {
            return step.slice.content.content.some( node => (node.type.name == "apogeeComponent") );
        }
    }

    /** This method takes a selection pointing at one document and makes a new one pointing at the given
     * document. The positions in the documents must match.
     */
    convertSelectionToNewDoc(selection,newDoc) {
        let $newAnchor = newDoc.resolve(selection.$anchor.pos);
        let $newHead = newDoc.resolve(selection.$head.pos);
        if(selection instanceof TextSelection) {
            return new TextSelection($newAnchor,$newHead);
        }
        else if(selection instanceof NodeSelection) {
            return new NodeSelection($newAnchor);
        }
        else {
            throw new Exception("Unknown selection type: " + selection.constructor.name);
        }
        
    }

    /** This method maps the list of component names to a list of delete commands. */
    createDeleteComponentCommands(deletedComponentShortNames) {
        return deletedComponentShortNames.map(shortName => {

            let parentMember = this.getComponent().getParentFolderForChildren();
            let memberId = parentMember.lookupChildId(shortName);
            
            let commandData = {};
            commandData.type = "deleteComponent";
            commandData.memberId = memberId;
            return commandData;
        });
    }
    
    /** This method maps the list of component craete infos to a list of create commands. */
    createCreateComponentCommands(createdComponentInfos) {
        return createdComponentInfos.map( createInfo => {
            let state = createInfo.state;

            let parentMember = this.getComponent().getParentFolderForChildren();

            let commandData = {};
            commandData.type = "addComponent";
            commandData.parentId = parentMember.getId();
            commandData.memberJson = state.memberJson;
            commandData.componentJson = state.componentJson;
            return commandData;
        })
    }

    //------------------------------------------
    // Editor command processing from commands created outside the editor
    //------------------------------------------

    /** This method removes the node of the given name frmo the folder. If no
     * transaction argument is included, a new transaction will be created. If the
     * transaction object is included, the remove action will be added to it. 
     */
    getSelectApogeeNodeCommand(childShortName) {
        var state = this.getEditorState();
      
        let {found,from,to} = this.getComponentRange(state,childShortName);
        //end test

        if(found) {
            let $from = state.doc.resolve(from);
            let selection = new NodeSelection($from);
            let transaction = state.tr.setSelection(selection)//.scrollIntoView(); //TEST:CHANGE SCROLL INTO VIEW
            return this.createEditorCommand(transaction);
        }
        else {
            return null;
        }
    }

    /** This will move the selection to the start of the document. */
    getSelectStartOfDocumentCommand() {
        let state = this.getEditorState();
        let $startPos = state.doc.resolve(0);
        let selection = TextSelection.between($startPos, $startPos);
        let transaction = state.tr.setSelection(selection).scrollIntoView();
        return this.createEditorCommand(transaction);
    }

    /** This will move the selection to the end of the document. */
    getSelectEndOfDocumentCommand() {
        let state = this.getEditorState();
        //check the node
        let lastNode = state.doc.content.content[state.doc.content.content.length-1];
        let endPos = state.doc.content.size;
        let $endPos = state.doc.resolve(endPos);
        let selection;
        //We should get a different criteria here
        //We want to use the gap cursor if the last element is not a textblock or a parent to a text block (list!)
        //Currently only the apogeeComponent fits. 
        //If we add new blocks we might need new criteria, but I am not sure what it is now.
        if(lastNode.type.name == "apogeeComponent") {
            selection = new GapSelection($endPos);
        }
        else {
            selection = TextSelection.between($endPos, $endPos);
        }
        let transaction = state.tr.setSelection(selection).scrollIntoView();
        return this.createEditorCommand(transaction);
    }
    
    getComponentRange(editorData,componentShortName) {
        let doc = editorData.doc;
        let schema = editorData.schema;
        let result = {};
        doc.forEach((node, offset) => {
            if (node.type == schema.nodes.apogeeComponent) {
                if (node.attrs.name == componentShortName) {

                    if (result.found) {
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

    /** This method give focus to the editor for this componennt, if the component is showing. */
    giveEditorFocusIfShowing() {
        let display = this.getTabDisplay();
        if((display)&&(display.getIsShowing())) {
            let editorView = display.getEditorView(); 
            if(editorView.dom) {
                editorView.focus();
            }
        }
    }
      
    /** This method adds an apogee component node of the given name to the folder.
     * It will be placed in the current selection, unless the "insertAtEnd" argument is true. 
     * If no transaction argument is included, a new transaction will be created. If the
     * transaction object is included, the remove action will be added to it. 
     */
    getInsertApogeeNodeOnPageCommands(shortName,insertAtEnd) {
        let state = this.getEditorState();
        let schema = state.schema;
        let setupTransaction;
        let commandInfo = {};
        
        if(!insertAtEnd) {
            let { empty } = state.selection;
            if(!empty) {

                //BELOW I HAVE TWO MODELS FOR INSERTING A NEW NODE - OVER THE CURRENT SELECTION
                //OR AFTER THE CURRENT SELECTION 

                //-----------------------------------------------
                // START insert the node over the current selection
                // It is commented out because some users got confused when a node got deleted when they added a new one,
                // which happened in the case a node is selected.
                
                // setupTransaction = state.tr.deleteSelection(); 

                // //see if we need to delete any apogee nodes
                // var deletedComponentShortNames = this.getDeletedApogeeComponentShortNames(setupTransaction);
                // commandInfo.deletedComponentShortNames = deletedComponentShortNames

                // if(deletedComponentShortNames.length > 0) {
                //     //create delete commands
                //     commandInfo.deletedComponentCommands = this.createDeleteComponentCommands(deletedComponentShortNames); 
                // }

                //END insert over current selection
                //------------------------------------------------

                //-----------------------------------------------
                // START insert the node at the end of the current selection
                let $endPos = state.selection.$to;
                let selection = new TextSelection($endPos,$endPos);
                setupTransaction = state.tr.setSelection(selection);
                // END insert the node at the end of the current selection
                //------------------------------------------------
            }
        }
        else {
            //insert at end
            //move selection to end
            let docLength = state.doc.content.size;
            let $pos = state.doc.resolve(docLength);
            let selection = new TextSelection($pos,$pos);
            setupTransaction = state.tr.setSelection(selection);
        }

        if(setupTransaction) {
            let initial1Selection = state.selection;
            let initial1Marks = state.marks;
            commandInfo.editorSetupCommand = this.createEditorCommand(setupTransaction,initial1Selection,initial1Marks);
        }

        //create a second transaction
        let addTransaction;
        let initial2Selection;
        let initial2Marks;
        if(setupTransaction) {
            let config = {};
            config.doc = setupTransaction.doc;
            config.selection = setupTransaction.selection;
            config.storedMarks = setupTransaction.storedMarks;
            let intermediateState = EditorState.create(config);

            addTransaction = intermediateState.tr;
            initial2Selection = config.selection;
            initial2Marks = config.storedMarks;
        }
        else {
            addTransaction = state.tr;
            initial2Selection = state.selection;
            initial2Marks = state.marks;
        }

        //finish the document transaction
        addTransaction = addTransaction.replaceSelectionWith(schema.nodes.apogeeComponent.create({ "name": shortName }));
//TEST:CHANGE SCROLL INTO VIEW
//        addTransaction.scrollIntoView();
        commandInfo.editorAddCommand = this.createEditorCommand(addTransaction,initial2Selection,initial2Marks);

        return commandInfo;
        
    }

    
    /** This function returns the names of any apogee components nodes which are deleted in the
     * given transaction. */
    getDeletedApogeeComponentShortNames(transaction) {
        //prepare to get apogee nodes
        let transactionShortNames = [];
    
        //get all the replcaed apogee components
        transaction.steps.forEach( (step,index) => {
            let stepDoc = transaction.docs[index];
            let stepShortNames = this.getStepDeletedComponentShortNames(step,stepDoc);
            transactionShortNames.push(...stepShortNames);
        });
    
        return transactionShortNames;
    
    }

    /** This method removes the node of the given name frmo the folder. If no
     * transaction argument is included, a new transaction will be created. If the
     * transaction object is included, the remove action will be added to it. 
     */
    getRemoveApogeeNodeFromPageCommand(childShortName) {
        var state = this.getEditorState();
      
        let {found,from,to} = this.getComponentRange(state,childShortName);
        //end test

        if(found) {
            let transaction = state.tr.delete(from, to)//.scrollIntoView();//TEST:CHANGE SCROLL INTO VIEW
            var commandData = this.createEditorCommand(transaction,state.selection,state.marks);
            return commandData;
        }
        else {
            return null;
        }
    }

    /** This method updates the name attribute of the given node. If no 
     * transaction argument is included, a new transaction will be created. If the
     * transaction object is included, the remove action will be added to it. 
     */
    getRenameApogeeNodeCommands(memberId,oldShortName,newShortName) {
        var state = this.getEditorState();
        let {found,from,to} = this.getComponentRange(state,oldShortName);

        let commands = {};

        if(found) {
            //clear the component state (by recording member id)
            let setupTransaction = state.tr.replaceWith(from, to,state.schema.nodes.apogeeComponent.create({"memberId": memberId }));
            commands.setupCommand = this.createEditorCommand(setupTransaction,state.selection,state.marks);

            //later set the new name
            let config = {};
            config.doc = setupTransaction.doc;
            config.selection = setupTransaction.selection;
            config.storedMarks = setupTransaction.storedMarks;
            let intermediateState = EditorState.create(config);
            let setNameTransaction = intermediateState.tr.replaceWith(from, to,state.schema.nodes.apogeeComponent.create({"name": newShortName}));
            commands.setNameCommand = this.createEditorCommand(setNameTransaction,config.selection,config.storedMarks);

            return commands;
        }
        else {
            return null;
        }
    }
        
    //end page code
    //############################################################################################################

}

/** This is used to flag this as an edit component. */
ParentComponentView.isParentComponentView = true;


//temporary? See if we need this. 
function selectionBetween(view, $anchor, $head, bias) {
    return view.someProp("createSelectionBetween", f => f(view, $anchor, $head))
      || TextSelection.between($anchor, $head, bias)
  }