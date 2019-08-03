/** This component represents a table object. */
apogeeapp.app.CanvasFolderComponent = function(workspaceUI,folder) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folder,apogeeapp.app.CanvasFolderComponent);
};

apogeeapp.app.CanvasFolderComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.CanvasFolderComponent.prototype.constructor = apogeeapp.app.CanvasFolderComponent;

apogeeapp.app.CanvasFolderComponent.prototype.instantiateTabDisplay = function() {
    var folder = this.getMember();
    return new apogeeapp.app.CanvasFolderComponentDisplay(this,folder,folder);   
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

/** This method is used to load the child components from a json */
apogeeapp.app.CanvasFolderComponent.prototype.readChildrenFromJson = function(workspaceUI,childActionResults,json) {
    if(json.children) {
        workspaceUI.loadFolderComponentContentFromJson(childActionResults,json.children);
    }
    return true;  
}

//======================================
// Static methods
//======================================

//this is a method to help construct an emtpy folder component
apogeeapp.app.CanvasFolderComponent.EMPTY_FOLDER_COMPONENT_JSON  = {
    "type":"apogeeapp.app.CanvasFolderComponent"
};

apogeeapp.app.CanvasFolderComponent.createMemberJson = function(userInputValues,optionalBaseJson) {
    var json = apogeeapp.app.Component.createMemberJson(apogeeapp.app.CanvasFolderComponent,userInputValues,optionalBaseJson);
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
apogeeapp.app.CanvasFolderComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder"
};

//if we want to allow importing a workspace as this object, we must add this method to the generator
apogeeapp.app.CanvasFolderComponent.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    optionsJson.children = childrenJson;
}
