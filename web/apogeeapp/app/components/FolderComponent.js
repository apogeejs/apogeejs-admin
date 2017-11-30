/** This component represents a table object. */
apogeeapp.app.FolderComponent = function(workspaceUI,folder,options) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folder,apogeeapp.app.FolderComponent.generator);
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.FolderComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.FolderComponent.writeToJson);
    
    this.setOptions(options);
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

apogeeapp.app.FolderComponent.readFromJson = function(json) {
    if(json.children) {
        var workspaceUI = this.getWorkspaceUI();
        var folder = this.getMember();
        workspaceUI.loadFolderComponentContentFromJson(folder,json.children);
    }
}

//======================================
// Static methods
//======================================

//this is a method to help construct an emtpy folder component
apogeeapp.app.FolderComponent.EMPTY_FOLDER_COMPONENT_JSON  = {
    "type":"apogeeapp.app.FolderComponent"
};

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
    var actionResponse = apogee.action.doAction(json,true);
    
    var folder = json.member;

    if(folder) {       
        var folderComponent = apogeeapp.app.FolderComponent.createComponentFromMember(workspaceUI,folder,componentOptions);
        actionResponse.component = folderComponent;
    }
    return actionResponse;
}

apogeeapp.app.FolderComponent.createComponentFromMember = function(workspaceUI,member,componentJson) {
    return new apogeeapp.app.FolderComponent(workspaceUI,member,componentJson);
}


//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderComponent.generator = {};
apogeeapp.app.FolderComponent.generator.displayName = "Folder";
apogeeapp.app.FolderComponent.generator.uniqueName = "apogeeapp.app.FolderComponent";
apogeeapp.app.FolderComponent.generator.createComponent = apogeeapp.app.FolderComponent.createComponent;
apogeeapp.app.FolderComponent.generator.createComponentFromMember = apogeeapp.app.FolderComponent.createComponentFromMember;
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