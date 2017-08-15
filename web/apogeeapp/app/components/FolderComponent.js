/** This component represents a table object. */
apogeeapp.app.FolderComponent = function(workspaceUI,folder,componentJson) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folder,apogeeapp.app.FolderComponent.generator,componentJson);
    
    //add a cleanup and save actions
    this.addSaveAction(apogeeapp.app.FolderComponent.writeToJson);
    
    this.memberUpdated();
};

apogeeapp.app.FolderComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.FolderComponent.prototype.constructor = apogeeapp.app.FolderComponent;

apogeeapp.app.FolderComponent.prototype.instantiateTabDisplay = function() {
    var folder = this.getMember();
    this.tabDisplay = new apogeeapp.app.TabComponentDisplay(this,folder,folder);   
    return this.tabDisplay;
}


//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the table component. */
apogeeapp.app.FolderComponent.writeToJson = function(json) {
    var folder = this.getMember();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}



//======================================
// Static methods
//======================================

//add table listener
apogeeapp.app.FolderComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    if(data.children) {
        json.children = data.children;
    }
    json.type = apogee.Folder.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var folder = json.member;

    if(folder) {       
        var folderComponent = apogeeapp.app.FolderComponent.createComponentFromJson(workspaceUI,folder,componentOptions);
        actionResponse.component = folderComponent;
    }
    return actionResponse;
}

apogeeapp.app.FolderComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderComponent = new apogeeapp.app.FolderComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        workspaceUI.loadFolderComponentContentFromJson(member,componentJson.children);
    }
    
    return folderComponent;
}


//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderComponent.generator = {};
apogeeapp.app.FolderComponent.generator.displayName = "Folder";
apogeeapp.app.FolderComponent.generator.uniqueName = "apogeeapp.app.FolderComponent";
apogeeapp.app.FolderComponent.generator.createComponent = apogeeapp.app.FolderComponent.createComponent;
apogeeapp.app.FolderComponent.generator.createComponentFromJson = apogeeapp.app.FolderComponent.createComponentFromJson;
apogeeapp.app.FolderComponent.generator.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderComponent.generator.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderComponent.generator.ICON_RES_PATH = "/folderIcon.png";

apogeeapp.app.FolderComponent.generator.propertyDialogLines = [
    {
        "type":"invisible",
        "resultKey":"children"
    }
];

//if we want to allow importing a workspace as this object, we must add this method to the generator
apogeeapp.app.FolderComponent.generator.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    optionsJson.children = childrenJson;
}