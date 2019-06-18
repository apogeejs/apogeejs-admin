/** This component represents a table object. */
apogeeapp.app.FolderComponent = function(workspaceUI,folder) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folder,apogeeapp.app.FolderComponent);
};

apogeeapp.app.FolderComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.FolderComponent.prototype.constructor = apogeeapp.app.FolderComponent;

apogeeapp.app.FolderComponent.prototype.instantiateTabDisplay = function() {
    var folder = this.getMember();
    
    this.tabDisplay = new apogeeapp.app.LiteratePageComponentDisplay(this,folder,folder);
    //this.tabDisplay = new apogeeapp.app.CanvasFolderComponentDisplay(this,folder,folder);   
    return this.tabDisplay;
}

//==============================
// serialization
//==============================

/** This serializes the table component. */
apogeeapp.app.FolderComponent.prototype.writeToJson = function(json) {
    var folder = this.getMember();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}

apogeeapp.app.FolderComponent.prototype.readFromJson = function(json) {
    
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

apogeeapp.app.FolderComponent.createMemberJson = function(userInputValues,optionalBaseJson) {
    var json = apogeeapp.app.Component.createMemberJson(apogeeapp.app.FolderComponent,userInputValues,optionalBaseJson);
    if(userInputValues.children) {
        json.children = userInputValues.children;
    }
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderComponent.displayName = "Folder";
apogeeapp.app.FolderComponent.uniqueName = "apogeeapp.app.FolderComponent";
apogeeapp.app.FolderComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderComponent.ICON_RES_PATH = "/componentIcons/folder.png";
apogeeapp.app.FolderComponent.TREE_ENTRY_SORT_ORDER = apogeeapp.app.Component.FOLDER_COMPONENT_TYPE_SORT_ORDER;
apogeeapp.app.FolderComponent.DEFAULT_MEMBER_JSON = {
    "type": apogee.Folder.generator.type
};

//if we want to allow importing a workspace as this object, we must add this method to the generator
apogeeapp.app.FolderComponent.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    optionsJson.children = childrenJson;
}
