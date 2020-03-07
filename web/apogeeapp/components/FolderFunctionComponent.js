import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import ParentComponent from "/apogeeapp/component/ParentComponent.js";
import LiteratePageComponentDisplay from "/apogeeview/componentdisplay/literatepage/LiteratePageComponentDisplay.js";

/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
export default class FolderFunctionComponent extends ParentComponent {
        
    constructor(modelManager,folderFunction) {
        //extend parent component
        super(modelManager,folderFunction,FolderFunctionComponent);
        
        //register this object as a parent container
        var internalFolder = folderFunction.getInternalFolder();
        this.setField("member.root",internalFolder);
        modelManager.registerMember(internalFolder,this,folderFunction);
    }

    /** This overrides the get display method of componnet to return the function declaration. */
    getDisplayName(useFullPath) {
        let member = this.getMember();
        var name = useFullPath ? this.getFullName() : this.getName();
        var argList = member.getArgList();
        var argListString = argList.join(",");
        var returnValueString = member.getReturnValueString();
        
        var displayName = name + "(" + argListString + ")";
        if((returnValueString != null)&&(returnValueString.length > 0)) {
            displayName += " = " + returnValueString;
        }
        
        return displayName;
    }

    /** This method returns true if the display name field is updated. This method exists because
     * display name is potentially a compound field and this is a systematic way to see if it has changed.
     * Components modifying the getDisplayName method should also update this method.
     * Note this method only applies when useFullPath = false. We currently don't implement a method to see
     * if the full name was updated. */
    isDisplayNameUpdated() {
        return this.getMember().areAnyFieldsUpdated(["name","argList","returnValue"]);
    }

    //cludge================================================
    //I need a real solution for this
    //this is a temp solution to return the parent member for children added to this componnet
    //it is used for now when we paste into the document to create a new component.
    getParentFolderForChildren() {
        //use the internal folder
        return this.getField("member.root");
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
    static appendMemberChildren(optionsJson,childrenJson) {
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
