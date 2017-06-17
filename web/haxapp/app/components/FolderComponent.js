/** This component represents a table object. */
haxapp.app.FolderComponent = function(workspaceUI,folder,componentJson) {
    //extend parent component
    haxapp.app.ParentComponent.call(this,workspaceUI,folder,haxapp.app.FolderComponent.generator,componentJson);
    
    //add a cleanup and save actions
    this.addSaveAction(haxapp.app.FolderComponent.writeToJson);
    
    this.memberUpdated();
};

haxapp.app.FolderComponent.prototype = Object.create(haxapp.app.ParentComponent.prototype);
haxapp.app.FolderComponent.prototype.constructor = haxapp.app.FolderComponent;

//----------------------
// ParentContainer Methods
//----------------------

/** This returned the parent member object associated with this component. */
haxapp.app.FolderComponent.prototype.getParentMember = function() {
    return this.getObject();
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the table component. */
haxapp.app.FolderComponent.writeToJson = function(json) {
    var folder = this.getObject();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}



//======================================
// Static methods
//======================================

//add table listener
haxapp.app.FolderComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    if(data.children) {
        json.children = data.children;
    }
    json.type = hax.Folder.generator.type;
    var actionResponse = hax.action.doAction(json);
    
    var folder = json.member;

    if(folder) {       
        var folderComponent = haxapp.app.FolderComponent.createComponentFromJson(workspaceUI,folder,componentOptions);
        actionResponse.component = folderComponent;
    }
    return actionResponse;
}

haxapp.app.FolderComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderComponent = new haxapp.app.FolderComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        workspaceUI.loadFolderComponentContentFromJson(member,componentJson.children);
    }
    
    return folderComponent;
}


//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.FolderComponent.generator = {};
haxapp.app.FolderComponent.generator.displayName = "Folder";
haxapp.app.FolderComponent.generator.uniqueName = "haxapp.app.FolderComponent";
haxapp.app.FolderComponent.generator.createComponent = haxapp.app.FolderComponent.createComponent;
haxapp.app.FolderComponent.generator.createComponentFromJson = haxapp.app.FolderComponent.createComponentFromJson;
haxapp.app.FolderComponent.generator.DEFAULT_WIDTH = 500;
haxapp.app.FolderComponent.generator.DEFAULT_HEIGHT = 500;
haxapp.app.FolderComponent.generator.ICON_RES_PATH = "/folderIcon.png";

haxapp.app.FolderComponent.generator.propertyDialogLines = [
    {
        "type":"invisible",
        "resultKey":"children"
    }
];

//if we want to allow importing a workspace as this object, we must add this method to the generator
haxapp.app.FolderComponent.generator.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    optionsJson.children = childrenJson;
}