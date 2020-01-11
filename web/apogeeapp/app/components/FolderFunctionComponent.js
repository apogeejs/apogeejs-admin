import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import ParentComponent from "/apogeeapp/app/component/ParentComponent.js";
import LiteratePageComponentDisplay from "/apogeeapp/app/component/literatepage/LiteratePageComponentDisplay.js";

/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
export default class FolderFunctionComponent extends ParentComponent {
        
    constructor(workspaceUI,folderFunction) {
        //extend parent component
        super(workspaceUI,folderFunction,FolderFunctionComponent);
        
        //register this object as a parent container
        var internalFolder = folderFunction.getInternalFolder();
        workspaceUI.registerMember(internalFolder,this,folderFunction);
    }

    /** This overrides the get display method of componnet to return the function declaration. */
    getDisplayName(useFullPath) {
        var name = useFullPath ? this.getFullName() : this.getName();
        var argList = this.member.getArgList();
        var argListString = argList.join(",");
        var returnValueString = this.member.getReturnValueString();
        
        var displayName = name + "(" + argListString + ")";
        if((returnValueString != null)&&(returnValueString.length > 0)) {
            displayName += " = " + returnValueString;
        }
        
        return displayName;
    }

    instantiateTabDisplay() {
        let member = this.getMember();
        let folder = member.getInternalFolder();
        return new LiteratePageComponentDisplay(this,member,folder); 
    }

    //cludge================================================
    //I need a real solution for this
    //this is a temp solution to return the parent member for children added to this componnet
    //it is used for now when we paste into the document to create a new component.
    getParentForChildren() {
        let member = this.getMember();
        return member.getInternalFolder();
    }
    //=======================================================

    //==============================
    // Child Display
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return FolderFunctionComponent.TABLE_EDIT_SETTINGS;
    }

    //==============================
    // serialization
    //==============================

    /** This serializes the folderFunction component. */
    writeToJson(json) {

        //save the editor state
        if(this.editorData) {
            json.data = this.editorData.toJSON();
        }

        var folderFunction = this.getMember();
        var internalFolder = folderFunction.getInternalFolder();
        var workspaceUI = this.getWorkspaceUI();
        json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
    }

    readFromJson(json) {
        //read the editor state
        if((json.data)&&(json.data.doc)) {
            this.editorData = this.editorManager.createEditorState(json.data.doc);
            this.fieldUpdated("document");
        }
    }

    readChildrenFromJson(workspaceUI,childActionResults,json) {
    
        if(childActionResults.root) {
            //get the child action results for the internal folder, rather than the folder function member.
            //NOTE - we should handle multi-member components so we detect errors in an of the components.
            //at the time this is written, this is the only acknowledgement of the result for the internal folder.
            let externalChildActionResults = childActionResults.root.childActionResults;

            if(json.children) {
                workspaceUI.loadFolderComponentContentFromJson(externalChildActionResults,json.children);
            }
            return true;
        }
        else {
            //error - internal folder not requested or created
            return false;
        }  
    }

    static transferMemberProperties(inputValues,propertyJson) {
        if(!propertyJson.updateData) propertyJson.updateData = {};
        if(inputValues.argListString !== undefined) {
            propertyJson.updateData.argList = apogeeutil.parseStringArray(inputValues.argListString);
        }
        if(inputValues.returnValueString !== undefined) {
            propertyJson.updateData.returnValue = inputValues.returnValueString;
        }
    }

    //if we want to allow importing a workspace as this object, we must add this method to the generator
    static appendWorkspaceChildren(optionsJson,childrenJson) {
        var internalFolderJson = {};
        internalFolderJson.name = optionsJson.name;
        internalFolderJson.type = "apogee.Folder";
        internalFolderJson.children = childrenJson;
        optionsJson.internalFolder = internalFolderJson;
    }

}

//=======================
// Child View SEttings
//=======================

FolderFunctionComponent.VIEW_MODES = [
];

FolderFunctionComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": FolderFunctionComponent.VIEW_MODES,
}


//======================================
// This is the component generator, to register the component
//======================================

FolderFunctionComponent.displayName = "Folder Function";
FolderFunctionComponent.uniqueName = "apogeeapp.app.FolderFunctionComponent";
FolderFunctionComponent.hasTabEntry = true;
FolderFunctionComponent.hasChildEntry = true;
FolderFunctionComponent.ICON_RES_PATH = "/componentIcons/folderFunction.png";
FolderFunctionComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.FolderFunction",
    "children": {
        "root": {
            "name": "root",
            "type": "apogee.Folder",
        }
    }
};

FolderFunctionComponent.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    },
    {
        "type":"inputElement",
        "heading":"Return Val: ",
        "resultKey":"returnValueString"
    }
];
