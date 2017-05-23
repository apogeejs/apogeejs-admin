/** This component represents a folderFunction, which is a function that is programmed using
 *hax tables rather than writing code. */
haxapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //extend parent component
    haxapp.app.ParentComponent.call(this,workspaceUI,folderFunction,haxapp.app.FolderFunctionComponent.generator,componentJson);
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,this,folderFunction);
    
    this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(haxapp.app.FolderFunctionComponent.writeToJson);
};

haxapp.app.FolderFunctionComponent.prototype = Object.create(haxapp.app.ParentComponent.prototype);
haxapp.app.FolderFunctionComponent.prototype.constructor = haxapp.app.FolderFunctionComponent;

//----------------------
// ParentContainer Methods
//----------------------

/** This returned the parent member object associated with this component. */
haxapp.app.FolderFunctionComponent.prototype.getParentMember = function() {
    return this.getObject().getInternalFolder();
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
    if(data.internalFolder) {
        json.internalFolder = data.internalFolder;
    }
    json.type = hax.FolderFunction.generator.type;
    var actionResponse = hax.action.doAction(workspaceUI.getWorkspace(),json);
    
    var folderFunction = json.member;
    if(actionResponse.getSuccess()) {
        var folderFunctionComponent = haxapp.app.FolderFunctionComponent.createComponentFromJson(workspaceUI,folderFunction,componentOptions);
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
haxapp.app.FolderFunctionComponent.generator.ICON_RES_PATH = "/functionFolderIcon.png";

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
    },
    {
        "type":"invisible",
        "resultKey":"internalFolder"
    }
];

//if we want to allow importing a workspace as this object, we must add this method to the generator
haxapp.app.FolderFunctionComponent.generator.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    var internalFolderJson = {};
    internalFolderJson.name = optionsJson.name;
    internalFolderJson.type = hax.Folder.generator.type;
    haxapp.app.FolderComponent.generator.appendWorkspaceChildren(internalFolderJson,childrenJson);
    optionsJson.internalFolder = internalFolderJson;
}
