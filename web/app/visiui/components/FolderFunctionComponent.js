/** This component represents a folderFunction, which is a function that is programmed using
 *visicomp tables rather than writing code. */
visicomp.app.visiui.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,folderFunction,visicomp.app.visiui.FolderFunctionComponent.generator,componentJson);
    visicomp.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
	visicomp.visiui.ParentHighlighter.init.call(this,this.getContentElement());
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,null);
    workspaceUI.addComponentContainer(internalFolder,this);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FolderFunctionComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.FolderFunctionComponent,visicomp.visiui.ParentContainer);
visicomp.core.util.mixin(visicomp.app.visiui.FolderFunctionComponent,visicomp.visiui.ParentHighlighter);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
visicomp.app.visiui.FolderFunctionComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the folderFunction component. */
visicomp.app.visiui.FolderFunctionComponent.prototype.writeToJson = function(json) {
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.FolderFunctionComponent.prototype.populateFrame = function() {	
	this.setScrollingContentElement();
    
    //add context menu to create childrent
    var contentElement = this.getContentElement();
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var app = this.getWorkspaceUI().getApp();
    app.setFolderContextMenu(contentElement,internalFolder);
}

/** This method updates the component when the data changes. 
 * @private */    
visicomp.app.visiui.FolderFunctionComponent.prototype.memberUpdated = function() {
    //make sure the title is up to data
    var window = this.getWindow();
    if(window) {
        var functionObject = this.getObject();
        var displayName = functionObject.getDisplayName();
        var windowTitle = window.getTitle();
        if(windowTitle != displayName) {
            window.setTitle(displayName);
        }
    }
}

/** This method extends the base method to get the property values
 * for the property edit dialog. */
visicomp.app.visiui.FolderFunctionComponent.prototype.getPropertyValues = function() {
    var values = visicomp.app.visiui.Component.getPropertyValues.call(this);

    var argList = this.object.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    values.returnValueString = this.object.getReturnValueString();
    return values;
}

/** This method extends the base method to update property values. */
visicomp.app.visiui.FolderFunctionComponent.prototype.updatePropertyValues = function(newValues) {
    var argListString = newValues.argListString;
    var argList = visicomp.app.visiui.FunctionComponent.parseStringArray(argListString);
    var returnValueString = newValues.returnValueString;
    
    return visicomp.core.updatefolderFunction.updatePropertyValues(this.object,argList,returnValueString);
}

//======================================
// Static methods
//======================================

/** This method creates the component. */
visicomp.app.visiui.FolderFunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!

    var json = {};
    json.name = data.name; 
    if(data.argListString) {
        var argList = visicomp.app.visiui.FunctionComponent.parseStringArray(data.argListString);
        json.argList = argList;
    }
    if(data.returnValueString) {
        json.returnValue = data.returnValueString;
    }
    json.type = visicomp.core.FolderFunction.generator.type;
    
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var folderFunction = actionResponse.member;
    if(actionResponse.getSuccess()) {
        var folderFunctionComponent = new visicomp.app.visiui.FolderFunctionComponent(workspaceUI,folderFunction,componentOptions);
        actionResponse.component = folderFunctionComponent;
    }
    return actionResponse;
}

visicomp.app.visiui.FolderFunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderFunctionComponent = new visicomp.app.visiui.FolderFunctionComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(folder,componentJson.children);
    }
    return folderFunctionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.FolderFunctionComponent.generator = {};
visicomp.app.visiui.FolderFunctionComponent.generator.displayName = "Folder Function";
visicomp.app.visiui.FolderFunctionComponent.generator.uniqueName = "visicomp.app.visiui.FolderFunctionComponent";
visicomp.app.visiui.FolderFunctionComponent.generator.createComponent = visicomp.app.visiui.FolderFunctionComponent.createComponent;
visicomp.app.visiui.FolderFunctionComponent.generator.createComponentFromJson = visicomp.app.visiui.FolderFunctionComponent.createComponentFromJson;
visicomp.app.visiui.FolderFunctionComponent.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.FolderFunctionComponent.generator.DEFAULT_HEIGHT = 500;

visicomp.app.visiui.FolderFunctionComponent.generator.propertyDialogLines = [
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

