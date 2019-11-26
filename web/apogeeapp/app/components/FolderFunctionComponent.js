import util from "/apogeeutil/util.js";

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

    instantiateTabDisplay() {
        let member = this.getMember();
        let folder = member.getInternalFolder();
        return new LiteratePageComponentDisplay(this,member,folder); 
    }

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
        var folderFunction = this.getMember();
        var internalFolder = folderFunction.getInternalFolder();
        var workspaceUI = this.getWorkspaceUI();
        json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
    }

    readChildrenFromJson(workspaceUI,childActionResults,json) {
    
        //verify internal folder?

        if(json.children) {
            workspaceUI.loadFolderComponentContentFromJson(childActionResults,json.children);
        }
        return true;  
    }

    static transferMemberProperties(inputValues,propertyJson) {
        if(!propertyJson.updateData) propertyJson.updateData = {};
        if(inputValues.argListString !== undefined) {
            propertyJson.updateData.argList = util.parseStringArray(inputValues.argListString);
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
FolderFunctionComponent.DEFAULT_WIDTH = 500;
FolderFunctionComponent.DEFAULT_HEIGHT = 500;
FolderFunctionComponent.ICON_RES_PATH = "/componentIcons/folderFunction.png";
FolderFunctionComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.FolderFunction",
    "children": {
        "layout": {
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
