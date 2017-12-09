/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
apogeeapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folderFunction,apogeeapp.app.FolderFunctionComponent);
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,this,folderFunction);
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.FolderFunctionComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.FolderFunctionComponent.writeToJson);
};

apogeeapp.app.FolderFunctionComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.FolderFunctionComponent.prototype.constructor = apogeeapp.app.FolderFunctionComponent;

apogeeapp.app.FolderFunctionComponent.prototype.instantiateTabDisplay = function() {
    var member = this.getMember();
    var folder = member.getInternalFolder();
    this.tabDisplay = new apogeeapp.app.TabComponentDisplay(this,member,folder);   
    return this.tabDisplay;
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the folderFunction component. */
apogeeapp.app.FolderFunctionComponent.writeToJson = function(json) {
    var folderFunction = this.getMember();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

apogeeapp.app.FolderFunctionComponent.readFromJson = function(json) {
    if(json.children) {
        var workspaceUI = this.getWorkspaceUI();
        var folderFunction = this.getMember();
        var internalFolder = folderFunction.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(internalFolder,json.children);
    }
}

//======================================
// Static methods
//======================================

apogeeapp.app.FolderFunctionComponent.getMemberCreateAction = function(userInputValues) {
    var json = {};
    json.action = "createMember";
    json.owner = userInputValues.parent;
    json.workspace = userInputValues.parent.getWorkspace();
    json.name = userInputValues.name;
    if(userInputValues.argListString) {
        var argList = apogee.FunctionTable.parseStringArray(userInputValues.argListString);
        json.argList = argList;
    }
    if(userInputValues.returnValueString) {
        json.returnValue = userInputValues.returnValueString;
    }
    if(userInputValues.internalFolder) {
        json.internalFolder = userInputValues.internalFolder;
    }
    json.type = apogee.FolderFunction.generator.type;
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderFunctionComponent.displayName = "Folder Function";
apogeeapp.app.FolderFunctionComponent.uniqueName = "apogeeapp.app.FolderFunctionComponent";
apogeeapp.app.FolderFunctionComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderFunctionComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderFunctionComponent.ICON_RES_PATH = "/functionFolderIcon.png";

apogeeapp.app.FolderFunctionComponent.propertyDialogLines = [
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
apogeeapp.app.FolderFunctionComponent.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    var internalFolderJson = {};
    internalFolderJson.name = optionsJson.name;
    internalFolderJson.type = apogee.Folder.generator.type;
    apogeeapp.app.FolderComponent.generator.appendWorkspaceChildren(internalFolderJson,childrenJson);
    optionsJson.internalFolder = internalFolderJson;
}
