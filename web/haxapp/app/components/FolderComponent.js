/** This component represents a table object. */
haxapp.app.FolderComponent = function(workspaceUI,folder,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,folder,haxapp.app.FolderComponent.generator,componentJson);
    
    //add a cleanup and save actions
    this.addSaveAction(haxapp.app.FolderComponent.writeToJson);
};

//add components to this class
hax.base.mixin(haxapp.app.FolderComponent,haxapp.app.Component);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
haxapp.app.FolderComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================


/** This method populates the frame for this component. 
 * @protected */
haxapp.app.FolderComponent.prototype.populateFrame = function() {
	this.setScrollingContentElement();
    
    //add context menu to create childrent
    var contentElement = this.getContentElement();
    var folder = this.getObject();
    var app = this.getWorkspaceUI().getApp();
    app.setFolderContextMenu(contentElement,folder);
    
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
    json.name = data.name;
    json.type = hax.Folder.generator.type;
    var actionResponse = hax.action.doAction(workspaceUI.getWorkspace(),json);
    
    var folder = json.member;

    if(folder) {       
        var folderComponent = new haxapp.app.FolderComponent(workspaceUI,folder,componentOptions);
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