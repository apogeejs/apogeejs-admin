import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Component from "/apogeeapp/app/component/Component.js";

import "/apogeeapp/app/component/literatepage/literatepagetransaction.js";
import { createProseMirrorManager } from "/apogeeapp/app/component/literatepage/proseMirrorSetup.js";

import { TextSelection, NodeSelection, EditorState } from "/prosemirror/lib/prosemirror-state/src/index.js";
import { Step } from "/prosemirror/lib/prosemirror-transform/src/index.js";

//this constant is used (or hopefully not) in correctCreateInfoforRepeatedNames
const MAX_SUFFIX_INDEX = 99999;

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponent extends Component {

    constructor(workspaceUI,member,componentGenerator) {
        //base constructor
        super(workspaceUI,member,componentGenerator);

        //create an empty edit state to start
        this.editorManager = createProseMirrorManager(this);
        this.editorData = this.editorManager.createEditorState();
    }

    instantiateTreeEntry() {
        var treeDisplay = super.instantiateTreeEntry();
        
        //add any existing children to the tree entry
        var treeEntry = treeDisplay.getTreeEntry();
        var member = this.getMember();
        var childMap = member.getChildMap();
        for(var childKey in childMap) {
            var childMember = childMap[childKey];
            var childComponent = this.getWorkspaceUI().getComponent(childMember);
            if(childComponent) {
                var childTreeEntry = childComponent.getTreeEntry(true);
                treeEntry.addChild(childTreeEntry);
            }
        }
        
        return treeDisplay;
    }

    //###########################################################################################################
    //start page code
    
    getEditorData() {
        return this.editorData;
    }

    setEditorData(editorData) {
        this.editorData = editorData;
        
        //this should be in an event for the change
        var tabDisplay = this.getTabDisplay();
        if(tabDisplay) {
            tabDisplay.updateDocumentData(this.editorData);
        }
    }

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

            if(transactionUpdatesModel(transaction)) {

                //record if the transaction sets the selection or markSet
                let selection = transaction.selectionSet ? transaction.selection : null;
                let markSet = transaction.storedMarksSet ? transaction.storedMarks : null;

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
                        activeNameMap = this.updateActiveNameMapForDelete(activeNameMap,deletedComponentShortNames);

                        //get delete commands
                        deleteComponentCommands = this.createDeleteComponentCommands(deletedComponentShortNames);
                    }

                    //--------------------------------------
                    //process the step for any added components including potentially modifying the slice
                    //--------------------------------------
                    let createComponentCommands;
                    let { newSliceContentJson, createdComponentInfos } = this.processForStepComponentCreateCommands(oldStepJson,activeNameMap);
                    if(createdComponentInfos.length > 0) {
                        //update active name map
                        activeNameMap = this.updateActiveNameMapForCreate(activeNameMap,createdComponentInfos);

                        //get the create commands
                        createComponentCommands = this.createCreateComponentCommands(createdComponentInfos);
                    }

                    //--------------------------------------
                    // Update the new transaction and commands
                    //--------------------------------------
                    if((deleteComponentComands)||(createComponentCommands)) {
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
                            let editorCommand = this.createEditorCommand(modifiedTransaction);
                            commandList.push(editorCommand);

                            //create a new transaction
                            let config = {};
                            config.doc = modifiedTransaction.doc;
                            config.selection = modifiedTransaction.selection;
                            config.storedMarks = modifiedTransaction.storedMarks;
                            let intermediateState = EditorState.create(config);

                            modifiedTransaction = intermediateState.tr;
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

                //close out the final transaction, if needed
                if(transactionModified) {
                    //save the transaction as a command (so we can add the model commands now)
                    let editorCommand = this.createEditorCommand(modifiedTransaction);
                    commandList.push(editorCommand);
                }

                //create the apogee command for the input transaction
                apogeeCommand = {};
                apogeeCommand.type = "compoundCommand";
                apogeeCommand.childCommands = commands;
            }
            else {
                //--------------------------
                //There is no change to the model. Convert the transaction directly to an editor command
                //--------------------------
                apogeeCommand = this.createEditorCommand(transaction);
            }

            //-------------------
            //execute the command
            //-------------------
            if(apogeeCommand) {
                this.getWorkspaceUI().getApp().executeCommand(apogeeCommand);
            }
        }
        else {
            //------------------------------
            //this is a editor state change that doesn't change the saved data
            //------------------------------
            this.editorData = this.editorData.apply(transaction);
            this.fieldUpdated("document");
            
            if(this.tabDisplay) {
                this.tabDisplay.updateDocumentData(this.editorData);
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
        for(let name in this.member.getChildMap()) {
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

    /** This function updates the active name map for the list of created components. If updates the map in place, but also returns it. */
    updateActiveNameMapForCreate(activeNameMap,createdComponentInfos) {
        createdComponentInfos.forEach( componentInfo => {
            activeNameMap[componentInfo.name] = true;
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
    
    /**  */
    processForStepComponentCreateCommands(oldStepJson,activeNameMap) {
        let newSliceContentJson;
        let createdComponentInfos = [];

        if(!this.stepHasCreateComponentNode(step)) {
            //no modified step or create component commands needed
            newSliceContentJson = oldStepJson.slice.content;
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
     * use to create the component. It will be modified if the name already exists. This function does not modify
     * the active name struct, so it you try to create the same name twice it will succeed here and fail later. */
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
            nameCheckStruct[name] = true;
            return name
        }
    }

    /** This method returns true if the given step has any create component node command. */
    stepHasCreateComponentNode(step) {
        if((step.jsonID == "replace")||(step.jsonID == "replaceAround")) {
            return step.slice.content.content.some( node => (node.type.name == "apogeeComponent") );
        }
    }

    createRemoveStep(oldStepJson) {
        throw new Error("Implement create remove step");
    }
    
    createInsertStep(oldStepJson,newSliceContentJson) {
        throw new Error("Implement create Insert step");
    }

    /** This method maps the list of component names to a list of delete commands. */
    createDeleteComponentCommands(deletedComponentShortNames) {
        return deletedComponentShortNames.map(shortName => {
            let fullName = this.member.getChildFullName(shortName);
            let commandData = {};
            commandData.type = "deleteComponent";
            commandData.memberFullName = fullName;
            return commandData;
        });
    }
    
    /** This method maps the list of component craete infos to a list of create commands. */
    createCreateComponentCommands(createdComponentInfos) {
        return createdComponentInfos.map( createInfo => {
            let state = createInfo.state;

            let commandData = {};
            commandData.type = "addComponent";
            commandData.parentFullName = this.member.getFullName();
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
    createEditorCommand(transaction) {
        var stepsJson = [];
        var inverseStepsJson = [];

        let startSelectionJson = this.editorData.selection.toJSON();
        let startMarksJson = this.editorData.marks ? this.editorData.marks.map(mark => mark.toJSON()) : [];

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

        let endSelectionJson = transaction.selection.toJSON();
        let endMarksJson = transaction.marks ? transaction.marks.map(mark => mark.toJSON()) : [];

        var commandData = {};
        commandData.type = "literatePageTransaction";
        commandData.memberFullName = this.member.getFullName();
        commandData.steps = stepsJson;
        commandData.startSelection = startSelectionJson;
        commandData.startMarks = startMarksJson;
        commandData.undoSteps = inverseStepsJson;
        commandData.endSelection = endSelectionJson;
        commandData.endMarks = endMarksJson;
        
        return commandData;
    }

    /** This method removes the node of the given name frmo the folder. If no
     * transaction argument is included, a new transaction will be created. If the
     * transaction object is included, the remove action will be added to it. 
     */
    selectApogeeNode(childShortName) {
        var state = this.getEditorData();
      
        let {found,from,to} = this.editorManager.getComponentRange(state,childShortName);
        //end test

        if(found) {
            let $from = state.doc.resolve(from);
            let selection = new NodeSelection($from);
            let transaction = state.tr.setSelection(selection);
            this.applyTransaction(transaction);
        }
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
        let commands = {};
        
        if(!insertAtEnd) {
            let { empty } = state.selection;
            if(!empty) {

                setupTransaction = state.tr.deleteSelection(); 

                //see if we need to delete any apogee nodes
                var deletedApogeeComponents = this.getDeletedApogeeComponentShortNames(setupTransaction);

                if(deletedApogeeComponents.length > 0) {
                    //create delete commands
                    commands.deletedComponentCommands = this.createDeleteComponentCommands(deletedApogeeComponents); 
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
            commands.editorSetupCommand = this.createEditorCommand(setupTransaction);
        }

        //create a second transaction
        let addTransaction;
        if(setupTransaction) {
            let config = {};
            config.doc = setupTransaction.doc;
            config.selection = setupTransaction.selection;
            config.storedMarks = setupTransaction.storedMarks;
            let intermediateState = EditorState.create(config);
            addTransaction = intermediateState.tr;
        }
        else {
            addTransaction = state.tr;
        }

        //finish the document transaction
        addTransaction = addTransaction.replaceSelectionWith(schema.nodes.apogeeComponent.create({ "name": shortName }));
      
        commands.editorAddCommand = this.createEditorCommand(addTransaction);

        return commands;
        
    }

    
    /** This function returns the names of any apogee components nodes which are deleted in the
     * given transaction. */
    getDeletedApogeeComponentShortNames(transaction) {
        //prepare to get apogee nodes
        let transactionShortNames = [];
    
        //get all the replcaed apogee components
        transaction.steps.forEach( (step,index) => {
            let stepDoc = transaction.docs[index];
            let stepShortName = this.getStepDeletedComponentShortNames(step,stepDoc);
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
      
        let {found,from,to} = this.editorManager.getComponentRange(state,childShortName);
        //end test

        if(found) {
            let transaction = state.tr.delete(from, to);
            var commandData = this.createEditorCommand(transaction);
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
        let {found,from,to} = this.editorManager.getComponentRange(state,oldShortName);

        let commands = {};

        if(found) {
            //clear the component state (my recording member id)
            let setupTransaction = state.tr.replaceWith(from, to,state.schema.nodes.apogeeComponent.create({"memberId": memberId }));
            commands.setupCommand = this.createEditorCommand(setupTransaction);

            //later set the new name
            let config = {};
            config.doc = setupTransaction.doc;
            config.selection = setupTransaction.selection;
            config.storedMarks = setupTransaction.storedMarks;
            let intermediateState = EditorState.create(config);
            let setNameTransaction = intermediateState.tr.replaceWith(from, to,state.schema.nodes.apogeeComponent.create({"name": newShortName}));
            commands.setNameCommand = this.createEditorCommand(setNameTransaction);

            return commands;
        }
        else {
            return null;
        }
    }

        
    //end page code
    //############################################################################################################

    //----------------------
    // Parent Methods
    //----------------------
        
    usesTabDisplay() {    
        return true;
    }

    /** This brings the child component to the front and takes any other actions
     * to show the child in the open parent. */
    showChildComponent(childComponent) {
        if(childComponent.getMember().getParent() != this.getMember()) return;
        
        if(this.tabDisplay) {
            this.tabDisplay.showChildComponent(childComponent);
        }
    }



    /** This function adds a fhile componeent to the displays for this parent component. */
    removeChildComponent(childComponent) {
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
    addChildComponent(childComponent) {
        //add the child to the tree entry
        var treeEntry = this.getTreeEntry();
        if(treeEntry) {
            var childTreeEntry = childComponent.getTreeEntry(true);
            treeEntry.addChild(childTreeEntry);
        }

        //add child entry for tab
        if(this.tabDisplay) {
            this.tabDisplay.addChildComponent(childComponent); 
        }
    }
}

/** This is used to flag this as an edit component. */
ParentComponent.isParentComponent = true;