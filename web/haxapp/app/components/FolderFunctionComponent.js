/** This component represents a folderFunction, which is a function that is programmed using
 *hax tables rather than writing code. */
haxapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,folderFunction,haxapp.app.FolderFunctionComponent.generator,componentJson);
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,this,folderFunction);
    
    this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(haxapp.app.FolderFunctionComponent.writeToJson);
};

//add components to this class
hax.base.mixin(haxapp.app.FolderFunctionComponent,haxapp.app.Component);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
haxapp.app.FolderFunctionComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.FolderFunctionComponent.prototype.createComponentDisplay = function(container) {
    return new haxapp.app.ParentComponentDisplay(this,container);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.FolderFunctionComponent.prototype.populateFrame = function() {	
	this.setScrollingContentElement();
    
    //add context menu to create childrent
    var contentElement = this.getContentElement();
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var app = this.getWorkspaceUI().getApp();
    app.setFolderContextMenu(contentElement,internalFolder);
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the folderFunction component. */
haxapp.app.FolderFunctionComponent.writeToJson = function(json) {
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

//======================================
// Static methods
//======================================

/** This method creates the component. */
haxapp.app.FolderFunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.name = data.name;
    if(data.argListString) {
        var argList = hax.FunctionTable.parseStringArray(data.argListString);
        json.argList = argList;
    }
    if(data.returnValueString) {
        json.returnValue = data.returnValueString;
    }
    json.type = hax.FolderFunction.generator.type;
    var actionResponse = hax.action.doAction(workspaceUI.getWorkspace(),json);
    
    var folderFunction = json.member;
    if(actionResponse.getSuccess()) {
        var folderFunctionComponent = new haxapp.app.FolderFunctionComponent(workspaceUI,folderFunction,componentOptions);
        actionResponse.component = folderFunctionComponent;
    }
    return actionResponse;
}

haxapp.app.FolderFunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderFunctionComponent = new haxapp.app.FolderFunctionComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(folder,componentJson.children);
    }
    return folderFunctionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.FolderFunctionComponent.generator = {};
haxapp.app.FolderFunctionComponent.generator.displayName = "Folder Function";
haxapp.app.FolderFunctionComponent.generator.uniqueName = "haxapp.app.FolderFunctionComponent";
haxapp.app.FolderFunctionComponent.generator.createComponent = haxapp.app.FolderFunctionComponent.createComponent;
haxapp.app.FolderFunctionComponent.generator.createComponentFromJson = haxapp.app.FolderFunctionComponent.createComponentFromJson;
haxapp.app.FolderFunctionComponent.generator.DEFAULT_WIDTH = 500;
haxapp.app.FolderFunctionComponent.generator.DEFAULT_HEIGHT = 500;

haxapp.app.FolderFunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    },
    {
        "type":"inputElement",
        "heading":"Return Val: ",
        "resultKey":"returnValueString"
    }
];
