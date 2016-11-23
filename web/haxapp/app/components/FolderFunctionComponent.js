/** This component represents a folderFunction, which is a function that is programmed using
 *hax tables rather than writing code. */
haxapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,folderFunction,haxapp.app.FolderFunctionComponent.generator,componentJson);
    haxapp.ui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
	haxapp.ui.ParentHighlighter.init.call(this,this.getContentElement());
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,null);
    workspaceUI.addComponentContainer(internalFolder,this);
    
    this.memberUpdated();
};

//add components to this class
hax.util.mixin(haxapp.app.FolderFunctionComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.FolderFunctionComponent,haxapp.ui.ParentContainer);
hax.util.mixin(haxapp.app.FolderFunctionComponent,haxapp.ui.ParentHighlighter);

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

/** This serializes the folderFunction component. */
haxapp.app.FolderFunctionComponent.prototype.writeToJson = function(json) {
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
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
// Static methods
//======================================

/** This method creates the component. */
haxapp.app.FolderFunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!

    var json = {};
    json.name = data.name; 
    if(data.argListString) {
        var argList = haxapp.app.FunctionComponent.parseStringArray(data.argListString);
        json.argList = argList;
    }
    if(data.returnValueString) {
        json.returnValue = data.returnValueString;
    }
    json.type = hax.FolderFunction.generator.type;
    
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var folderFunction = actionResponse.member;
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


/** This method extends the base method to get the property values
 * for the property edit dialog. */
haxapp.app.FolderFunctionComponent.addPropValues = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    values.returnValueString = member.getReturnValueString();
    return values;
}

haxapp.app.FolderFunctionComponent.propUpdateHandler = function(member,oldValues,newValues,recalculateList) {
    if((oldValues.argListString !== newValues.argListString)||(oldValues.returnValueString !== newValues.returnValueString)) {
        var newArgList = haxapp.app.FunctionComponent.parseStringArray(newValues.argListString);
        hax.updatefolderFunction.updatePropertyValues(member,newArgList,newValues.returnValueString,recalculateList);
    }    
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
haxapp.app.FolderFunctionComponent.generator.addPropFunction = haxapp.app.FolderFunctionComponent.addPropValues;
haxapp.app.FolderFunctionComponent.generator.updatePropHandler = haxapp.app.FolderFunctionComponent.propUpdateHandler;
