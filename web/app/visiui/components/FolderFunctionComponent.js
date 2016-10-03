/** This component represents a folderFunction, which is a function that is programmed using
 *hax tables rather than writing code. */
hax.app.visiui.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //base init
    hax.app.visiui.Component.init.call(this,workspaceUI,folderFunction,hax.app.visiui.FolderFunctionComponent.generator,componentJson);
    hax.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
	hax.visiui.ParentHighlighter.init.call(this,this.getContentElement());
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,null);
    workspaceUI.addComponentContainer(internalFolder,this);
    
    this.memberUpdated();
};

//add components to this class
hax.core.util.mixin(hax.app.visiui.FolderFunctionComponent,hax.app.visiui.Component);
hax.core.util.mixin(hax.app.visiui.FolderFunctionComponent,hax.visiui.ParentContainer);
hax.core.util.mixin(hax.app.visiui.FolderFunctionComponent,hax.visiui.ParentHighlighter);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
hax.app.visiui.FolderFunctionComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the folderFunction component. */
hax.app.visiui.FolderFunctionComponent.prototype.writeToJson = function(json) {
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

/** This method populates the frame for this component. 
 * @protected */
hax.app.visiui.FolderFunctionComponent.prototype.populateFrame = function() {	
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
hax.app.visiui.FolderFunctionComponent.prototype.memberUpdated = function() {
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
hax.app.visiui.FolderFunctionComponent.prototype.getPropertyValues = function() {
    var values = hax.app.visiui.Component.getPropertyValues.call(this);

    var argList = this.object.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    values.returnValueString = this.object.getReturnValueString();
    return values;
}

/** This method extends the base method to update property values. */
hax.app.visiui.FolderFunctionComponent.prototype.updatePropertyValues = function(newValues) {
    var argListString = newValues.argListString;
    var argList = hax.app.visiui.FunctionComponent.parseStringArray(argListString);
    var returnValueString = newValues.returnValueString;
    
    return hax.core.updatefolderFunction.updatePropertyValues(this.object,argList,returnValueString);
}

//======================================
// Static methods
//======================================

/** This method creates the component. */
hax.app.visiui.FolderFunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!

    var json = {};
    json.name = data.name; 
    if(data.argListString) {
        var argList = hax.app.visiui.FunctionComponent.parseStringArray(data.argListString);
        json.argList = argList;
    }
    if(data.returnValueString) {
        json.returnValue = data.returnValueString;
    }
    json.type = hax.core.FolderFunction.generator.type;
    
    var actionResponse = hax.core.createmember.createMember(parent,json);
    
    var folderFunction = actionResponse.member;
    if(actionResponse.getSuccess()) {
        var folderFunctionComponent = new hax.app.visiui.FolderFunctionComponent(workspaceUI,folderFunction,componentOptions);
        actionResponse.component = folderFunctionComponent;
    }
    return actionResponse;
}

hax.app.visiui.FolderFunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderFunctionComponent = new hax.app.visiui.FolderFunctionComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(folder,componentJson.children);
    }
    return folderFunctionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

hax.app.visiui.FolderFunctionComponent.generator = {};
hax.app.visiui.FolderFunctionComponent.generator.displayName = "Folder Function";
hax.app.visiui.FolderFunctionComponent.generator.uniqueName = "hax.app.visiui.FolderFunctionComponent";
hax.app.visiui.FolderFunctionComponent.generator.createComponent = hax.app.visiui.FolderFunctionComponent.createComponent;
hax.app.visiui.FolderFunctionComponent.generator.createComponentFromJson = hax.app.visiui.FolderFunctionComponent.createComponentFromJson;
hax.app.visiui.FolderFunctionComponent.generator.DEFAULT_WIDTH = 500;
hax.app.visiui.FolderFunctionComponent.generator.DEFAULT_HEIGHT = 500;

hax.app.visiui.FolderFunctionComponent.generator.propertyDialogLines = [
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

