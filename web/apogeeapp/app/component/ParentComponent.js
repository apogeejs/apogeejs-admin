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

            //command
            let commands = [];

            //see if we need to delete any apogee nodes
            var deletedApogeeComponentNames = this.getDeletedApogeeComponentShortNames(transaction);

            //WE SHOULD ADD EDITOR COMMAND PART 1 HERE - A DELETE!

            //add delete command after the editor nodes have been removed
            if(deletedApogeeComponentNames.length > 0) {
                let doDelete = confirm("Are you sure you want to delete these apogee nodes: " + deletedApogeeComponentNames);
                //do not do delete.
                if(!doDelete) return;

                //do the delete
                let deletedComponentCommands = this.getDeletedComponentCommandsFromShortNames(deletedApogeeComponentNames);

                //add these to the list of commands
                commands.push(...deletedComponentCommands);
            }

            if(this.transactionHasComponentCreate(transaction)) {

                let {modifiedTransaction,componentCreateCommands} = this.getModifiedCommandsForCreate(transaction,deletedApogeeComponentNames);

                //use the new transaction
                transaction = modifiedTransaction;

                //add these to the list of commands
                commands.push(...componentCreateCommands);
            }

            //create the editor command to delete the component node
            let editorCommand = this.createEditorCommand(transaction);
            commands.push(editorCommand);

            let commandData;
            //combine commands or use the editor command directly
            if(commands.length > 1) {
                commandData = {};
                commandData.type = "compoundCommand";
                commandData.childCommands = commands;
            }
            else if(commands.length === 1) {
                commandData = commands[0];
            }

            //execute the command
            if(commandData) {
                this.getWorkspaceUI().getApp().executeCommand(commandData);
            }
        }
        else {
            //this is a editor state change that doesn't change the data
            this.editorData = this.editorData.apply(transaction);
            this.fieldUpdated("document");
            
            if(this.tabDisplay) {
                this.tabDisplay.updateDocumentData(this.editorData);
            }
        }
    }

    //---------------------------------------------
    // Delete Component detection and processing
    //---------------------------------------------

    /** This function returns the names of any apogee components nodes which are deleted in the
     * given transaction. */
    getDeletedApogeeComponentShortNames(transaction) {
        //prepare to get apogee nodes
        let apogeeComponents = [];
        let getApogeeComponents = node => {
        if(node.type.name == "apogeeComponent") {
            var componentShortName = node.attrs.name; //we should change this node attribute name
            apogeeComponents.push(componentShortName);
        }
        //do not go inside any top level nodes
        return false;
        }
    
        //get all the replcaed apogee components
        transaction.steps.forEach( (step,index) => {
            let doc = transaction.docs[index];
            if(step.jsonID == "replace") {
                doc.nodesBetween(step.from,step.to,getApogeeComponents);
            }
            else if(step.jsonID == "replaceAround") {
                doc.nodesBetween(step.from,step.gapFrom,getApogeeComponents);
                doc.nodesBetween(step.gapTo,step.to,getApogeeComponents);
            }
        });
    
        return apogeeComponents;
    
    }

    /** This function creates component delete commands from a list of short component names. */
    getDeletedComponentCommandsFromShortNames(deletedApogeeComponents) {
        //map the names to delete commands
        return deletedApogeeComponents.map(shortName => {
            let fullName = this.member.getChildFullName(shortName);
            let commandData = {};
            commandData.type = "deleteComponent";
            commandData.memberFullName = fullName;
            return commandData;
        });
    }

    //---------------------------------------------
    // Add Component detection and processing
    //---------------------------------------------

    /** This function detects if a transaction has an create component node commands. */
    transactionHasComponentCreate(transaction) {
        let hasCreate = false;

        //get all the replcaed apogee components
        transaction.steps.forEach( step => {
            if(this.stepHasCreateComponentNode(step)) {
                hasCreate = true;
            }
        });
    
        return hasCreate;
    }

    /** This method will create a modified editor transaction and create any needed apogee create component
     * commands if needed fro the transaction. */
    getModifiedCommandsForCreate(transaction,deletedApogeeComponentNames) {
        //init name change struct
        let nameCheckStruct = this.getNameCheckStruct(deletedApogeeComponentNames)

        //make a new transaction with modified component create info
        let modifiedTransaction = this.editorData.tr;

        //we will capture the component create commands that are needed
        let componentCreateCommands = [];

        //process these steps to get the modified steps and the create component commands
        transaction.steps.forEach( step =>  {
            //get the modified step (it may be the old step) and any needed create component commands
            let {modifiedStep,stepCreateCommands} = this.processStepForCreateTransaction(step,nameCheckStruct);
            modifiedTransaction.step(modifiedStep);
            if(stepCreateCommands) {
                componentCreateCommands.push(...stepCreateCommands);
            }
        });
        
        return {modifiedTransaction,componentCreateCommands};
    }

    /** This generates an initial list of existing names in the folder. */
    getNameCheckStruct(deletedApogeeComponentNames) {
        //retrieve the existing names
        let nameCheckStruct = {};
        for(let name in this.member.getChildMap()) {
            nameCheckStruct[name] = true;
        }

        //remove the deleted names
        deletedApogeeComponentNames.forEach( name => delete nameCheckStruct[name]);

        return nameCheckStruct;
    }

    /** This method checks the name of a created component and returns the proper name to 
     * use to create the component. It will be modified if the name already exists. The function
     * also returns the modified names struct use to record the curren tname list, which it modifies in place. */
    createComponentReplacementNameProcessing(name,nameCheckStruct) {
        if(nameCheckStruct[name]) {
            //repeat name! - modify it with a suffix
            for(let suffixIndex = 1; true; suffixIndex++) {
                let testName = name + "_" + suffixIndex;
                if(!nameCheckStruct[testName]) {
                    let newName = testName;
                    //mark this name as used
                    nameCheckStruct[newName] = true;
                    return {name:newName, nameCheckStruct: nameCheckStruct};
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
            return {name,nameCheckStruct}
        }
    }

    /** This method returns the proper transaction step - possibly modified - and the create component commands. */
    processStepForCreateTransaction(step,nameCheckStruct) {
        if(!this.stepHasCreateComponentNode(step)) {
            //no modified step or create component commands needed
            return { modifiedStep: step, stepCreateCommands: [] };
        }
        else {
            //we need to modify the step and make create component command(s)
            let stepJson = step.toJSON();
            let newContentJson = [];
            let stepCreateCommands = [];
            if((stepJson.stepType == "replace")||(stepJson.stepType == "replaceAround")) {
                stepJson.slice.content.forEach( nodeJson => {

                    if(nodeJson.type == "apogeeComponent") {
                        let newNodeJson = apogee.util.jsonCopy(nodeJson);

                        //remove the state
                        let state = newNodeJson.attrs.state;
                        delete newNodeJson.attrs.state;

                        //get the name and do any needed name processing
                        let name = newNodeJson.attrs.name;

                        let newNameInfo = this.createComponentReplacementNameProcessing(name,nameCheckStruct);
                        nameCheckStruct = newNameInfo.nameCheckStruct;
                        if(newNameInfo.name != name) {
                            name = newNameInfo.name;
                            newNodeJson.attrs.name = name;

                            //we need to change the name in the state too
                           if(state) {
                                state.memberJson.name = name;                                
                            }
                        }

                        //create the new component for this node and add to commands for this ste-
                        if(state) {
                            let createCommand = this.getCreateChildComponentCommmand(state);
                            stepCreateCommands.push(createCommand);

                            //I SHOULD DO SOMETHING IF THE STATE IS MISSING - MAYBE DON'T CREATE THE NODE?
                        }

                        //store the modified json
                        newContentJson.push(newNodeJson);
                    }
                    else {
                        //not a component, store the original node
                        newContentJson.push(nodeJson);
                    }
                })
            }


            //add the new content into the step
            stepJson.slice.content = newContentJson;

            //convert back to a step
            let newStep = Step.fromJSON(this.editorData.schema, stepJson);

            //return the new step
            return { modifiedStep: newStep, stepCreateCommands: stepCreateCommands };
        }
    }

    /** This method makes a create coomponent command.  */
    getCreateChildComponentCommmand(state) {
        let commandData = {};
        commandData.type = "addComponent";
        commandData.parentFullName = this.member.getFullName();
        commandData.memberJson = state.memberJson;
        commandData.componentJson = state.componentJson;
        return commandData;
    }

    /** This method returns true if the given step has any create component node command. */
    stepHasCreateComponentNode(step) {
        if((step.jsonID == "replace")||(step.jsonID == "replaceAround")) {
            return step.slice.content.content.some( node => (node.type.name == "apogeeComponent") );
        }
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
                    commands.deletedComponentCommands = this.getDeletedComponentCommandsFromShortNames(deletedApogeeComponents); 
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