/** This component represents a table object. */
haxapp.app.FolderComponent = function(workspaceUI,folder,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,folder,haxapp.app.FolderComponent.generator,componentJson);
    haxapp.ui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
	haxapp.ui.ParentHighlighter.init.call(this,this.getContentElement());
    
    //register this folder as a parent container
    workspaceUI.addComponentContainer(folder,this);
};

//add components to this class
hax.util.mixin(haxapp.app.FolderComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.FolderComponent,haxapp.ui.ParentContainer);
hax.util.mixin(haxapp.app.FolderComponent,haxapp.ui.ParentHighlighter);

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

/** This serializes the table component. */
haxapp.app.FolderComponent.prototype.writeToJson = function(json) {
    var folder = this.getObject();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}

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
// Static methods
//======================================

//add table listener
haxapp.app.FolderComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.Folder.generator.type;
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var folder = actionResponse.member;
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