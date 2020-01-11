
import Component from "/apogeeapp/app/component/Component.js";
import ParentComponent from "/apogeeapp/app/component/ParentComponent.js";
import LiteratePageComponentDisplay from "/apogeeapp/app/component/literatepage/LiteratePageComponentDisplay.js";


/** This component represents a table object. */
export default class FolderComponent extends ParentComponent {

    constructor(workspaceUI,folder) {
        //extend parent component
        super(workspaceUI,folder,FolderComponent);
    };

    instantiateTabDisplay() {
        var folder = this.getMember();
        return new LiteratePageComponentDisplay(this,folder,folder); 
    }

    //cludge================================================
    //I need a real solution for this
    //this is a temp solution to return the parent member for children added to this componnet
    //it is used for now when we paste into the document to create a new component.
    getParentForChildren() {
        return this.member;
    }
    //=======================================================

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
            this.editorData = this.editorManager.createEditorState(json.data.doc);
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
FolderComponent.hasTabEntry = true;
FolderComponent.hasChildEntry = false;
FolderComponent.ICON_RES_PATH = "/componentIcons/folder.png";
FolderComponent.TREE_ENTRY_SORT_ORDER = Component.FOLDER_COMPONENT_TYPE_SORT_ORDER;
FolderComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder"
};
