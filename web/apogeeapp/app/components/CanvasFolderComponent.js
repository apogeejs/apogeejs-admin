/** This component represents a table object. */
apogeeapp.app.CanvasFolderComponent = function(workspaceUI,folder) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folder,apogeeapp.app.CanvasFolderComponent);
};

apogeeapp.app.CanvasFolderComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.CanvasFolderComponent.prototype.constructor = apogeeapp.app.CanvasFolderComponent;

apogeeapp.app.CanvasFolderComponent.prototype.instantiateTabDisplay = function() {
    var folder = this.getMember();
    this.tabDisplay = new apogeeapp.app.CanvasFolderComponentDisplay(this,folder,folder);   
    return this.tabDisplay;
}

//======================================
// serialization methods
//======================================

/** This serializes the table component. */
apogeeapp.app.CanvasFolderComponent.prototype.writeToJson = function(json) {
    var folder = this.getMember();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}

apogeeapp.app.CanvasFolderComponent.prototype.readFromJson = function(json) {
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
apogeeapp.app.CanvasFolderComponent.EMPTY_FOLDER_COMPONENT_JSON  = {
    "type":"apogeeapp.app.CanvasFolderComponent"
};

apogeeapp.app.CanvasFolderComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    if(userInputValues.children) {
        json.children = userInputValues.children;
    }
    json.type = apogee.Folder.generator.type;
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.CanvasFolderComponent.displayName = "CanvasFolder";
apogeeapp.app.CanvasFolderComponent.uniqueName = "apogeeapp.app.CanvasFolderComponent";
apogeeapp.app.CanvasFolderComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.CanvasFolderComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.CanvasFolderComponent.ICON_RES_PATH = "/componentIcons/folder.png";
apogeeapp.app.CanvasFolderComponent.TREE_ENTRY_SORT_ORDER = apogeeapp.app.Component.FOLDER_COMPONENT_TYPE_SORT_ORDER;

apogeeapp.app.CanvasFolderComponent.propertyDialogLines = [
    {
        "type":"invisible",
        "resultKey":"children"
    }
];

//if we want to allow importing a workspace as this object, we must add this method to the generator
apogeeapp.app.CanvasFolderComponent.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    optionsJson.children = childrenJson;
}
