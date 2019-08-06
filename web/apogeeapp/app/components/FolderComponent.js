import proseMirror from "/apogeeapp/app/component/literatepage/proseMirrorSetup.js";

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

    //================================================================
    //start test code
    //temporary implementation
        
    applyTransaction(transaction) {
        
        //console.log("New Transaction:");
        //console.log("Doc changed: " + transaction.docChanged);

        if(transaction.docChanged) {
            var commandData = this.createInsertCommand(transaction);
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

    createInsertCommand(transaction) {
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
        commandData.type = apogeeapp.app.literatepagetransaction.COMMAND_TYPE;
        commandData.memberFullName = this.member.getFullName();
        commandData.steps = stepsJson;
        commandData.undoSteps = inverseStepsJson;
        
        return commandData;
    }

        
    //end test code
    //=========================================================================
        
    instantiateTabDisplay() {
        var folder = this.getMember();
        return new apogeeapp.app.LiteratePageComponentDisplay(this,folder,folder); 
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



    static createMemberJson(userInputValues,optionalBaseJson) {
        var json = Component.createMemberJson(apogeeapp.app.FolderComponent,userInputValues,optionalBaseJson);
        return json;
    }

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


