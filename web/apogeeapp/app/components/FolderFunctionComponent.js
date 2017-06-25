/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
apogeeapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folderFunction,apogeeapp.app.FolderFunctionComponent.generator,componentJson);
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,this,folderFunction);
    
    this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(apogeeapp.app.FolderFunctionComponent.writeToJson);
};

apogeeapp.app.FolderFunctionComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.FolderFunctionComponent.prototype.constructor = apogeeapp.app.FolderFunctionComponent;

//----------------------
// ParentContainer Methods
//----------------------

/** This returned the parent member object associated with this component. */
apogeeapp.app.FolderFunctionComponent.prototype.getParentMember = function() {
    return this.getObject().getInternalFolder();
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the folderFunction component. */
apogeeapp.app.FolderFunctionComponent.writeToJson = function(json) {
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

//======================================
// Static methods
//======================================

/** This method creates the component. */
apogeeapp.app.FolderFunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    if(data.argListString) {
        var argList = apogee.FunctionTable.parseStringArray(data.argListString);
        json.argList = argList;
    }
    if(data.returnValueString) {
        json.returnValue = data.returnValueString;
    }
    if(data.internalFolder) {
        json.internalFolder = data.internalFolder;
    }
    json.type = apogee.FolderFunction.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var folderFunction = json.member;
    if(actionResponse.getSuccess()) {
        var folderFunctionComponent = apogeeapp.app.FolderFunctionComponent.createComponentFromJson(workspaceUI,folderFunction,componentOptions);
        actionResponse.component = folderFunctionComponent;
    }
    return actionResponse;
}

apogeeapp.app.FolderFunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderFunctionComponent = new apogeeapp.app.FolderFunctionComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(folder,componentJson.children);
    }
    return folderFunctionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderFunctionComponent.generator = {};
apogeeapp.app.FolderFunctionComponent.generator.displayName = "Folder Function";
apogeeapp.app.FolderFunctionComponent.generator.uniqueName = "apogeeapp.app.FolderFunctionComponent";
apogeeapp.app.FolderFunctionComponent.generator.createComponent = apogeeapp.app.FolderFunctionComponent.createComponent;
apogeeapp.app.FolderFunctionComponent.generator.createComponentFromJson = apogeeapp.app.FolderFunctionComponent.createComponentFromJson;
apogeeapp.app.FolderFunctionComponent.generator.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderFunctionComponent.generator.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderFunctionComponent.generator.ICON_RES_PATH = "/functionFolderIcon.png";

apogeeapp.app.FolderFunctionComponent.generator.propertyDialogLines = [
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
apogeeapp.app.FolderFunctionComponent.generator.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    var internalFolderJson = {};
    internalFolderJson.name = optionsJson.name;
    internalFolderJson.type = apogee.Folder.generator.type;
    apogeeapp.app.FolderComponent.generator.appendWorkspaceChildren(internalFolderJson,childrenJson);
    optionsJson.internalFolder = internalFolderJson;
}
