import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";

import "/apogeeapp/commands/literatepagetransaction.js";
import { createProseMirrorManager } from "/apogeeview/componentdisplay/literatepage/proseMirrorSetup.js";

import { TextSelection, NodeSelection, EditorState, Selection } from "/prosemirror/lib/prosemirror-state/src/index.js";
import { Step } from "/prosemirror/lib/prosemirror-transform/src/index.js";
import { Mark }  from "/prosemirror/lib/prosemirror-model/src/index.js";

//this constant is used (or hopefully not) in correctCreateInfoforRepeatedNames
const MAX_SUFFIX_INDEX = 99999;

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponentView extends ComponentView {

    constructor(modelView,component) {
        //base constructor
        super(modelView,component);

        //ccreate the editor manager
        this.editorManager = createProseMirrorManager(modelView.getApp(),component.getSchema());

        this.editorData = null;
        this._loadEditorData(component);
    }

    createTreeDisplay() {
        var treeDisplay = super.createTreeDisplay();
        
        //add any existing children to the tree entry
        var treeEntry = treeDisplay.getTreeEntry();
        var member = this.component.getMember();
        var modelView = this.getModelView();
        var modelManager = modelView.getModelManager();
        var childIdMap = member.getChildIdMap();
        for(var childKey in childIdMap) {
            var childMemberId = childIdMap[childKey];
            var childComponentId = modelManager.getComponentIdByMemberId(childMemberId);
            var childComponentView = modelView.getComponentViewByComponentId(childComponentId);
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

    /** This brings the child component to the front and takes any other actions
     * to show the child in the open parent. */
    showChild(childComponentView) {
        if(childComponentView.getParentComponentView() != this) return;
        this.selectApogeeNode(childComponentView.getName());
    }

    /** This function adds a fhile componeent to the displays for this parent component. */
    removeChild(childComponent) {
        //remove from tree entry
        var treeEntry = this.getTreeEntry();
        if(treeEntry) {
            var childTreeEntry = childComponent.getTreeEntry();
            if(childTreeEntry) {
                treeEntry.removeChild(childTreeEntry);
            }
        }
        
        //remove child windows - just hide them. They will be deleted in the component
        childComponent.closeComponentDisplay();
    }

    /** This function adds a fhile componeent to the displays for this parent component. */
    addChild(childComponentView) {
        //we need to record the child was assigned here, to be used if the component view is moved
        childComponentView.setLastAssignedParentComponentView(this);

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

    //==============================
    // TEMP
    //==============================

    /** This overides the super method to first intercept the new document and save the editor data */
    componentUpdated(component) {
        //set the document data
        if(component.isFieldUpdated("document")) {
            this._loadEditorData(component);
        }

        //update the component and its ui elements
        super.componentUpdated(component);
    }

    _loadEditorData(component) {
        let document = component.getDocument();
        let editorStateInfo = component.getEditorStateInfo(true);
        let schema = component.getSchema();

        let selection;
        let storedMarks;
        if(editorStateInfo) {
            //load the saved selection
            let selectionJson = editorStateInfo.selection;
            if(selectionJson) {
                selection = Selection.fromJSON(document,selectionJson);
            }

            //load the saved marks
            let storedMarksJson = editorStateInfo.storedMarks;
            if(storedMarksJson) {
                storedMarks = storedMarksJson.map(markJson => Mark.fromJson(schema,markJson));
            }
        }

        this.editorData = this.editorManager.createEditorState(document,selection,storedMarks);
    }

    //###########################################################################################################
    //start page code
    
    getEditorData() {
        return this.editorData;
    }

    // setEditorData(editorData) {
    //     this.editorData = editorData;
        
    //     //this should be in an event for the change
    //     var tabDisplay = this.getTabDisplay();
    //     if(tabDisplay) {
    //         tabDisplay.updateDocumentData(this.editorData);
    //     }
    // }

    getEditorManager() {
        return this.editorManager;
    }

    //----------------------------------------
    // Editor Command Processing
    //----------------------------------------
    
    /** This method is called to respond to transactions created in the editor. */
    applyTransaction(transaction) {
        
        //console.log("New Transaction:");
        //console.log("Doc changed: " + transaction.docChanged);

        if(transaction.docChanged) {

            //this will hold the resulting command
            let apogeeCommand;

            let initialSelection = this.editorData.selection;
            let initialMarks = this.editorData.marks;

            if(this.transactionUpdatesModel(transaction)) {

                let commandList = [];
                let allDeletedNames = [];

                //record if the transaction sets the selection or markSet
                let finalSelection = transaction.selectionSet ? transaction.selection : null;
                let finalStoredMarks = transaction.storedMarksSet ? transaction.storedMarks : null;

                let workingInitialSelection = initialSelection;
                let workingInitialMarks = initialMarks;

                //process each step, mapping to new steps
                let activeNameMap = this.createActiveNameMap();
                let modifiedTransaction = this.editorData.tr;
                let transactionModified = false;
                transaction.steps.forEach( (oldStep, index) => {

                    let oldStepDoc = transaction.docs[index];
                    let oldStepJson = oldStep.toJSON();

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
                    let { newSliceContentJson, createdComponentInfos } = this.processForStepComponentCreateCommands(oldStep,oldStepJson,activeNameMap);
                    if(createdComponentInfos.length > 0) {
                        //get the create commands
                        createComponentCommands = this.createCreateComponentCommands(createdComponentInfos);

                        //perhaps confusingly, the activeNameMap is updated in place in the above function so we don't have to 
                        //do it here.
                    }

                    //--------------------------------------
                    // Update the new transaction and commands
                    //--------------------------------------
                    if((deleteComponentCommands)||(createComponentCommands)) {
                        //we want to modify the step and insert the delete and/or create component commands

                        //----------------------------------
                        //create the remove step (if needed)
                        //-----------------------------------
                        let removeStep = this.createRemoveStep(oldStepJson);
                        if(removeStep) {
                            modifiedTransaction.step(removeStep);
                            transactionModified = true;
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
                        let insertStep = this.createInsertStep(oldStepJson,newSliceContentJson);
                        if(insertStep) {
                            modifiedTransaction.step(insertStep);
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
                    modifiedTransaction.scrollIntoView();

                    //save the transaction as a command (so we can add the model commands now)
                    let editorCommand = this.createEditorCommand(modifiedTransaction,workingInitialSelection,workingInitialMarks);
                    commandList.push(editorCommand);
                }

                //-------------------
                // Get verificaion if we are deleting anything
                //-------------------
                if(allDeletedNames.length > 0) {
                    let doDelete = confirm("Are you sure you want to delete these apogee nodes: " + allDeletedNames);
                    if(!doDelete) return;
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
                this.getModelView().getApp().executeCommand(apogeeCommand);
            }
        }
        else {
            //------------------------------
            //this is a editor state change that doesn't change the saved data
            //------------------------------
            this.editorData = this.editorData.apply(transaction);
            
            //##############################################
            //DOH! this is bad. I need to update the split between view and app for the editor
            //-I  shouldn't update the view editor data without updating the component editor data. But I have to as is.
            if(this.tabDisplay) {
                this.tabDisplay.nonComponentDocumentUpdate();
            }
        }
    }

    //---------------------------------------
    // Transaction Processing to extract model commands
    //---------------------------------------

    /** This function checks if the editor transaction creates or deletes any apogee components. */
    transactionUpdatesModel(transaction) {
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
    processForStepComponentCreateCommands(oldStep,oldStepJson,activeNameMap) {
        let newSliceContentJson;
        let createdComponentInfos = [];

        if(!this.stepHasCreateComponentNode(oldStep)) {
            //no modified step or create component commands needed
            if(oldStepJson.slice) newSliceContentJson = oldStepJson.slice.content;
            createdComponentInfos = [];
        }
        else {
            newSliceContentJson = [];
            if((oldStepJson.stepType == "replace")||(oldStepJson.stepType == "replaceAround")) {
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
        }

        //return the new step
        return { newSliceContentJson, createdComponentInfos };
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
            return new TextSelection($newAnchor);
        }
        else {
            throw new Exception("Unknown selection type: " + selection.constructor.name);
        }
        
    }

    /** This method takes an input step that includes a delete and/or create and makes the associated remove step. 
     * The insert step is made in createInsertStep. This method returns null if there is no remove step.
     * The new step will keep the same bounds for the replace but it will remove the slice that is inserted.
     */
    createRemoveStep(oldStepJson) {
        let newStepJson;
        if(oldStepJson.stepType == "replace") {
            if(oldStepJson.from != oldStepJson.to) {
                newStepJson = {};
                newStepJson.stepType = "replace";
                newStepJson.from = oldStepJson.from;
                newStepJson.to = oldStepJson.to;
            }
            else {
                newStepJson = null;
            }
        }
        else if(oldStepJson.stepType == "replaceAround") {
            if((oldStepJson.from != oldStepJson.gapFrom)&&(oldStepJson.gapTo != oldStepJson.to)) {
                newStepJson = {};
                newStepJson.stepType = "replaceAround";
                newStepJson.from = oldStepJson.from;
                newStepJson.gapFrom = oldStepJson.gapFrom;
                newStepJson.gapTo = oldStepJson.gapTo;
                newStepJson.to = oldStepJson.to;
            }
            else {
                newStepJson = null;
            }
        }
        else {
            throw new Error("Unknown editor step type: " + oldStepJson.stepType);
        }

        return newStepJson ? Step.fromJSON(this.editorData.schema, newStepJson) : null;
    }
    
    /** This method takes an input step that includes a delete and/or create and makes the associated insert step. 
     * The remove step is made in createRemoveStep. This method returns null if there is no insert step.
     * The new step will keep the same slice for the insert but it will remove no content.
     */
    createInsertStep(oldStepJson,newSliceContentJson) {
        if(newSliceContentJson) {
            //make a copy to keep the old slice info - but we will insert the potentiall modified content
            let newStepJson = apogeeutil.jsonCopy(oldStepJson);
            newStepJson.slice.content = newSliceContentJson
            //update the locations
            if(oldStepJson.stepType == "replace") {
                newStepJson.from = oldStepJson.from;
                newStepJson.to = oldStepJson.from;
            }
            else if(oldStepJson.stepType == "replaceAround") {
                newStepJson.from = oldStepJson.from;
                newStepJson.gapFrom = newStepJson.from;
                let gapSize = oldStepJson.gapTo - oldStepJson.gapFrom;
                newStepJson.gapTo = newStepJson.gapFrom + gapSize;
                newStepJson.to = newStepJson.gapTo;
            }
            else {
                throw new Error("Unknown editor step type: " + oldStepJson.stepType);
            }

            return  Step.fromJSON(this.editorData.schema, newStepJson);
        }
        else {
            //no insert done
            return null;
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

    /** This function turns a transaction into an application command. This is used
     * for the command path for commands generated outside the editor. */
    createEditorCommand(transaction,optionalInitialSelection,optionalInitialMarks) {
        var stepsJson = [];
        var inverseStepsJson = [];

        for(var i = 0; i < transaction.steps.length; i++) {
            var step = transaction.steps[i];
            stepsJson.push(step.toJSON());
            var stepDoc = transaction.docs[i];
            var inverseStep = step.invert(stepDoc);
            //this is in the wrong order - we will reverse it below
            inverseStepsJson.push(inverseStep.toJSON()); 
        }

        //fix the order of inverse commands
        inverseStepsJson.reverse();

        var commandData = {};
        commandData.type = "literatePageTransaction";
        commandData.memberId = this.getComponent().getMemberId();
        commandData.steps = stepsJson;
        commandData.undoSteps = inverseStepsJson;

        if(optionalInitialSelection) commandData.startSelection = optionalInitialSelection.toJSON();
        if(optionalInitialMarks) commandData.startMarks = optionalInitialMarks.map(mark => mark.toJSON());;

        if(transaction.selection) commandData.endSelection = transaction.selection.toJSON();
        if(transaction.marks) commandData.endMarks = transaction.marks.map(mark => mark.toJSON());
        
        return commandData;
    }

    /** This method removes the node of the given name frmo the folder. If no
     * transaction argument is included, a new transaction will be created. If the
     * transaction object is included, the remove action will be added to it. 
     */
    selectApogeeNode(childShortName) {
        var state = this.getEditorData();
      
        let {found,from,to} = this.getComponentRange(state,childShortName);
        //end test

        if(found) {
            let $from = state.doc.resolve(from);
            let selection = new NodeSelection($from);
            let transaction = state.tr.setSelection(selection).scrollIntoView();
            this.applyTransaction(transaction);
        }
    }

    
    getComponentRange = function(editorData,componentShortName) {
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
        let state = this.getEditorData();
        let schema = state.schema;
        let setupTransaction;
        let commandInfo = {};
        
        if(!insertAtEnd) {
            let { empty } = state.selection;
            if(!empty) {

                setupTransaction = state.tr.deleteSelection(); 

                //see if we need to delete any apogee nodes
                var deletedComponentShortNames = this.getDeletedApogeeComponentShortNames(setupTransaction);
                commandInfo.deletedComponentShortNames = deletedComponentShortNames

                if(deletedComponentShortNames.length > 0) {
                    //create delete commands
                    commandInfo.deletedComponentCommands = this.createDeleteComponentCommands(deletedComponentShortNames); 
                }
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
        addTransaction.scrollIntoView();
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
        var state = this.getEditorData();
      
        let {found,from,to} = this.getComponentRange(state,childShortName);
        //end test

        if(found) {
            let transaction = state.tr.delete(from, to).scrollIntoView();
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
        var state = this.getEditorData();
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