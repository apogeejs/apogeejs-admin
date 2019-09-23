import proseMirror from "/apogeeapp/app/component/literatepage/proseMirrorSetup.js";
import LiteratePageComponentDisplay from "/apogeeapp/app/component/literatepage/LiteratePageComponentDisplay.js";
import "/apogeeapp/app/component/literatepage/literatepagetransaction.js";

import Component from "/apogeeapp/app/component/Component.js";
import ParentComponent from "/apogeeapp/app/component/ParentComponent.js";

/** This component represents a table object. */
export default class FolderComponent extends ParentComponent {

    constructor(workspaceUI,folder) {
        //extend parent component
        super(workspaceUI,folder,FolderComponent);
        
        //create an empty edit state to start
        this.editorData = proseMirror.createEditorState();
    };


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

    /** This method is called to respond to transactions created in the editor. */
    applyTransaction(transaction) {
        
        //console.log("New Transaction:");
        //console.log("Doc changed: " + transaction.docChanged);

        if(transaction.docChanged) {
            //see if we need to delete any apogee nodes
            var deletedApogeeNodes = this.getDeletedApogeeNodes(this.editorData,transaction);

            if(deletedApogeeNodes.length > 0) {
                let doDelete = confirm("The selection includes Apogee nodes. Are you sure you want to delete them?");
                //do not do delete.
                //if(!doDelete) return null;
                if(!doDelete) alert("sorry - they will be deleted anyway, until the code is fixed.")
            }

            //delete the apogee nodes
            //(add this)

            var commandData = this.createEditorCommand(transaction);
            this.getWorkspaceUI().getApp().executeCommand(commandData);
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

    getDeletedApogeeNodes(editorData, transaction) {
        //prepare to get apogee nodes
        let apogeeNodes = [];
        let getApogeeNodes = node => {
        if(node.type.name == "apogeeComponent") {
            apogeeNodes.push(node);
        }
        //do not go inside any top level nodes
        return false;
        }
    
        //get all the replcaed apogee nodes
        transaction.steps.forEach( step => {
        if(step.jsonID == "replace") {
            editorData.doc.nodesBetween(step.from,step.to,getApogeeNodes);
        }
        else if(step.jsonID == "replaceAround") {
            editorData.doc.nodesBetween(step.from,step.gapFrom,getApogeeNodes);
            editorData.doc.nodesBetween(step.gapTo,step.to,getApogeeNodes);
        }
        });
    
        return apogeeNodes;
    
    }

    createEditorCommand(transaction) {
        var stepsJson = [];
        var inverseStepsJson = [];

        for(var i = 0; i < transaction.steps.length; i++) {
            var step = transaction.steps[i];
            stepsJson.push(step.toJSON());
            var stepDoc = transaction.docs[i];
            var inverseStep = step.invert(stepDoc);
            inverseStepsJson.push(inverseStep.toJSON()); 
        }

        var commandData = {};
        commandData.type = "literatePageTransaction";
        commandData.memberFullName = this.member.getFullName();
        commandData.steps = stepsJson;
        commandData.undoSteps = inverseStepsJson;
        
        return commandData;
    }

    getInsertIsOk() {
        var state = this.getEditorData();
      
        return (insertPoint(state.doc, state.selection.from, schema.nodes.apogeeComponent) != null);
    }
      
    insertComponentOnPage(childName) {
        var state = this.getEditorData();
      
        let { empty, $from, $to } = state.selection, content = Fragment.empty
        if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
          content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
        let transaction = state.tr.replaceSelectionWith(schema.nodes.apogeeComponent.create({ "state": childName }));
      
        var commandData = this.createEditorCommand(transaction);
        return commandData;
    }

    removeComponentFromPage(childShortName) {
        var state = this.getEditorData();
      
        //let { empty, $from, $to } = proseMirror.getComponentRange(childName), content = Fragment.empty
        let {found,from,to} = proseMirror.getComponentRange(state,childShortName);
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

        
    //end test code
    //=========================================================================
        
    instantiateTabDisplay() {
        var folder = this.getMember();
        return new LiteratePageComponentDisplay(this,folder,folder); 
    }

    //==============================
    // serialization
    //==============================

    /** This serializes the table component. */
    writeToJson(json) {
        //save the editor state
        if(this.editorData) {
            json.data = this.editorData.toJSON();
        }
        
        //save the children
        var folder = this.getMember();
        var workspaceUI = this.getWorkspaceUI();
        json.children = workspaceUI.getFolderComponentContentJson(folder);

        return json;
    }

    readFromJson(json) {
        //read the editor state
        if((json.data)&&(json.data.doc)) {
            this.editorData = proseMirror.createEditorState(json.data.doc);
            this.fieldUpdated("document");
        }
    }

    /** This method is used to load the child components from a json */
    readChildrenFromJson(workspaceUI,childActionResults,json) {
        if(json.children) {
            workspaceUI.loadFolderComponentContentFromJson(childActionResults,json.children);
        }
        return true;  
    }

    //======================================
    // Static methods
    //======================================

    //if we want to allow importing a workspace as this object, we must add this method to the generator
    static appendWorkspaceChildren(optionsJson,childrenJson) {
        optionsJson.children = childrenJson;
    }

}

//this is a method to help construct an emtpy folder component
FolderComponent.EMPTY_FOLDER_COMPONENT_JSON  = {
    "type":"apogeeapp.app.FolderComponent"
};

//======================================
// This is the component generator, to register the component
//======================================

FolderComponent.displayName = "Folder";
FolderComponent.uniqueName = "apogeeapp.app.FolderComponent";
FolderComponent.DEFAULT_WIDTH = 500;
FolderComponent.DEFAULT_HEIGHT = 500;
FolderComponent.ICON_RES_PATH = "/componentIcons/folder.png";
FolderComponent.TREE_ENTRY_SORT_ORDER = Component.FOLDER_COMPONENT_TYPE_SORT_ORDER;
FolderComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder"
};


