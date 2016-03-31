/** This component represents a table object. */
visicomp.app.visiui.FolderComponent = function(workspaceUI,folder,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,folder,visicomp.app.visiui.FolderComponent.generator,componentJson);
    visicomp.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
	visicomp.visiui.ParentHighlighter.init.call(this,this.getContentElement());
    
    //register this folder as a parent container
    workspaceUI.addComponentContainer(folder,this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FolderComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.FolderComponent,visicomp.visiui.ParentContainer);
visicomp.core.util.mixin(visicomp.app.visiui.FolderComponent,visicomp.visiui.ParentHighlighter);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
visicomp.app.visiui.FolderComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table component. */
visicomp.app.visiui.FolderComponent.prototype.writeToJson = function(json) {
    var folder = this.getObject();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.FolderComponent.prototype.populateFrame = function() {
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FolderComponent.createComponent = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.Folder.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var folder = actionResponse.member;
    if(folder) {       
        var folderComponent = new visicomp.app.visiui.FolderComponent(workspaceUI,folder);
        actionResponse.component = folderComponent;
    }
    return actionResponse;
}

visicomp.app.visiui.FolderComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderComponent = new visicomp.app.visiui.FolderComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        workspaceUI.loadFolderComponentContentFromJson(member,componentJson.children);
    }
    
    return folderComponent;
}


//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.FolderComponent.generator = {};
visicomp.app.visiui.FolderComponent.generator.displayName = "Folder";
visicomp.app.visiui.FolderComponent.generator.uniqueName = "visicomp.app.visiui.FolderComponent";
visicomp.app.visiui.FolderComponent.generator.createComponent = visicomp.app.visiui.FolderComponent.createComponent;
visicomp.app.visiui.FolderComponent.generator.createComponentFromJson = visicomp.app.visiui.FolderComponent.createComponentFromJson;
visicomp.app.visiui.FolderComponent.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.FolderComponent.generator.DEFAULT_HEIGHT = 500;