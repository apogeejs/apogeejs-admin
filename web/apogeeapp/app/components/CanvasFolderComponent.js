import Component from "/apogeeapp/app/component/Component.js";
import ParentComponent from "/apogeeapp/app/component/ParentComponent.js";

/** This component represents a table object. */
export default class CanvasFolderComponent extends ParentComponent {

    constructor(workspaceUI,folder) {
        //extend parent component
        super(workspaceUI,folder,CanvasFolderComponent);
    };


    instantiateTabDisplay() {
        var folder = this.getMember();
        return new apogeeapp.app.CanvasFolderComponentDisplay(this,folder,folder);   
    }

    //======================================
    // serialization methods
    //======================================

    /** This serializes the table component. */
    writeToJson(json) {
        var folder = this.getMember();
        var workspaceUI = this.getWorkspaceUI();
        json.children = workspaceUI.getFolderComponentContentJson(folder);
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
CanvasFolderComponent.EMPTY_FOLDER_COMPONENT_JSON  = {
    "type":"apogeeapp.app.CanvasFolderComponent"
};

//======================================
// This is the component generator, to register the component
//======================================

CanvasFolderComponent.displayName = "CanvasFolder";
CanvasFolderComponent.uniqueName = "apogeeapp.app.CanvasFolderComponent";
CanvasFolderComponent.DEFAULT_WIDTH = 500;
CanvasFolderComponent.DEFAULT_HEIGHT = 500;
CanvasFolderComponent.ICON_RES_PATH = "/componentIcons/folder.png";
CanvasFolderComponent.TREE_ENTRY_SORT_ORDER = Component.FOLDER_COMPONENT_TYPE_SORT_ORDER;
CanvasFolderComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder"
};
