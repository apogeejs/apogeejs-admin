
import Component from "/apogeeapp/component/Component.js";
import ParentComponent from "/apogeeapp/component/ParentComponent.js";

/** This component represents a table object. */
export default class FolderComponent extends ParentComponent {

    constructor(modelManager,folder) {
        //extend parent component
        super(modelManager,folder,FolderComponent);
    };

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
        var modelManager = this.getModelManager();
        json.children = modelManager.getFolderComponentContentJson(folder);

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
    readChildrenFromJson(modelManager,childActionResults,json) {
        let childCommandResults;
        if(json.children) {
            childCommandResults = modelManager.loadFolderComponentContentFromJson(childActionResults,json.children);
        }
        return childCommandResults;  
    }

    //======================================
    // Static methods
    //======================================

    //if we want to allow importing a workspace as this object, we must add this method to the generator
    static appendMemberChildren(optionsJson,childrenJson) {
        optionsJson.children = childrenJson;
    }

}

//======================================
// This is the component generator, to register the component
//======================================

FolderComponent.displayName = "Folder";
FolderComponent.uniqueName = "apogeeapp.app.FolderComponent";
FolderComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder"
};


