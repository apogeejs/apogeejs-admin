/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
apogeeapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folderFunction,apogeeapp.app.FolderFunctionComponent);
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,this,folderFunction);
};

apogeeapp.app.FolderFunctionComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.FolderFunctionComponent.prototype.constructor = apogeeapp.app.FolderFunctionComponent;

apogeeapp.app.FolderFunctionComponent.prototype.instantiateTabDisplay = function() {
    var member = this.getMember();
    var folder = member.getInternalFolder();
    return new apogeeapp.app.CanvasFolderComponentDisplay(this,member,folder);   
}

//==============================
// serialization
//==============================

/** This serializes the folderFunction component. */
apogeeapp.app.FolderFunctionComponent.prototype.writeToJson = function(json) {
    var folderFunction = this.getMember();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

apogeeapp.app.FolderFunctionComponent.prototype.readChildrenFromJson = function(workspaceUI,childActionResults,json) {
    //verify the internal folder was loaded
    var internalFolderActionResult = childActionResults[apogee.FolderFunction.INTERNAL_FOLDER_NAME];
    
    //verify success???
    //verify the action result exists!!!
    
    var internalFolderChildActionResults = internalFolderActionResult.childActionResults;
    
    if(json.children) {
        workspaceUI.loadFolderComponentContentFromJson(internalFolderChildActionResults,json.children);
    }
    return true;  
}

//======================================
// Static methods
//======================================

apogeeapp.app.FolderFunctionComponent.createMemberJson = function(userInputValues,optionalBaseJson) {
    var json = apogeeapp.app.Component.createMemberJson(apogeeapp.app.FolderFunctionComponent,userInputValues,optionalBaseJson);
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
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderFunctionComponent.displayName = "Folder Function";
apogeeapp.app.FolderFunctionComponent.uniqueName = "apogeeapp.app.FolderFunctionComponent";
apogeeapp.app.FolderFunctionComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderFunctionComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderFunctionComponent.ICON_RES_PATH = "/componentIcons/folderFunction.png";
apogeeapp.app.FolderFunctionComponent.DEFAULT_MEMBER_JSON = {
    "type": apogee.FolderFunction.generator.type
};
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
