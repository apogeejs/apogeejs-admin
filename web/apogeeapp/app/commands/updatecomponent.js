

apogeeapp.app.updatecomponent = {};

//=====================================
// Command Object
//=====================================

apogeeapp.app.updatecomponent.createUndoCommand = function(workspaceUI,commandJson) {
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.lookupMemberByFullName(commandJson.memberFullName);
    var component = workspaceUI.getComponent(member);
    
    var originalMemberProperties = member.readProperties();
    var originalComponentProperties = component.readExtendedProperties();
    
    var undoMemberProperties;
    var undoComponentProperties;
    
    if(commandJson.updatedMemberProperties) {
        undoMemberProperties = {};
        for(var propKey in commandJson.updatedMemberProperties) {
            undoMemberProperties = originalMemberProperties[propKey];
        }
    }
    
    if(commandJson.updatedMemberProperties) {
        undoComponentProperties = {};
        for(var propKey in commandJson.updatedComponentProperties) {
            undoComponentProperties = originalComponentProperties[propKey];
        }
    }
    
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.updatecomponent.COMMAND_TYPE;
    undoCommandJson.memberFullName = commandJson.memberFullName;
    if(undoMemberProperties) undoCommandJson.updatedMemberProperties = undoMemberProperties;
    if(undoComponentProperties) undoCommandJson.updatedComponentProperties = undoComponentProperties;
    
    return undoCommandJson;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
apogeeapp.app.updatecomponent.executeCommand = function(workspaceUI,commandJson) {
    
    var workspace = workspaceUI.getWorkspace();
    //get the member
    var member = workspace.getMemberByFullName(commandJson.memberFullName);   
    var component = workspaceUI.getComponent(member);

    //create an action to update an member additional properties
    var memberGenerator = member.generator;
    var actionData = memberGenerator.getPropertyUpdateAction(member,commandJson.updatedMemberProperties);  
    var actionResult = apogee.action.doAction(workspace,actionData);
    
    //update an component additional properties
    //NEED ERROR HANDLING HERE!!!
    if(actionResult.actionDone) {
        component.loadPropertyValues(commandJson.updatedComponentProperties);
    }
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.updatecomponent.COMMAND_TYPE = "updateComponent";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.updatecomponent);


