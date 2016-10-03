/** This component represents a table object. */
hax.app.visiui.FolderComponent = function(workspaceUI,folder,componentJson) {
    //base init
    hax.app.visiui.Component.init.call(this,workspaceUI,folder,hax.app.visiui.FolderComponent.generator,componentJson);
    hax.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
	hax.visiui.ParentHighlighter.init.call(this,this.getContentElement());
    
    //register this folder as a parent container
    workspaceUI.addComponentContainer(folder,this);
};

//add components to this class
hax.core.util.mixin(hax.app.visiui.FolderComponent,hax.app.visiui.Component);
hax.core.util.mixin(hax.app.visiui.FolderComponent,hax.visiui.ParentContainer);
hax.core.util.mixin(hax.app.visiui.FolderComponent,hax.visiui.ParentHighlighter);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
hax.app.visiui.FolderComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table component. */
hax.app.visiui.FolderComponent.prototype.writeToJson = function(json) {
    var folder = this.getObject();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}

/** This method populates the frame for this component. 
 * @protected */
hax.app.visiui.FolderComponent.prototype.populateFrame = function() {
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
hax.app.visiui.FolderComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.core.Folder.generator.type;
    var actionResponse = hax.core.createmember.createMember(parent,json);
    
    var folder = actionResponse.member;
    if(folder) {       
        var folderComponent = new hax.app.visiui.FolderComponent(workspaceUI,folder,componentOptions);
        actionResponse.component = folderComponent;
    }
    return actionResponse;
}

hax.app.visiui.FolderComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderComponent = new hax.app.visiui.FolderComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        workspaceUI.loadFolderComponentContentFromJson(member,componentJson.children);
    }
    
    return folderComponent;
}


//======================================
// This is the component generator, to register the component
//======================================

hax.app.visiui.FolderComponent.generator = {};
hax.app.visiui.FolderComponent.generator.displayName = "Folder";
hax.app.visiui.FolderComponent.generator.uniqueName = "hax.app.visiui.FolderComponent";
hax.app.visiui.FolderComponent.generator.createComponent = hax.app.visiui.FolderComponent.createComponent;
hax.app.visiui.FolderComponent.generator.createComponentFromJson = hax.app.visiui.FolderComponent.createComponentFromJson;
hax.app.visiui.FolderComponent.generator.DEFAULT_WIDTH = 500;
hax.app.visiui.FolderComponent.generator.DEFAULT_HEIGHT = 500;