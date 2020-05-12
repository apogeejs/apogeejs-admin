
import ParentComponent from "/apogeeapp/component/ParentComponent.js";

/** This component represents a table object. */
export default class FolderComponent extends ParentComponent {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //extend parent component
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        if(!instanceToCopy) {
            //initialize the schema
            this.initializeSchema(modelManager);
        }
    };

    //cludge================================================
    //I need a real solution for this
    //this is a temp solution to return the parent member for children added to this componnet
    //it is used for now when we paste into the document to create a new component.
    getParentFolderForChildren() {
        return this.getMember();
    }
    //=======================================================

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

FolderComponent.displayName = "Page";
FolderComponent.uniqueName = "apogeeapp.PageComponent";
FolderComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder"
};


