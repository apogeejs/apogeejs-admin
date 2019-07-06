

apogeeapp.app.movecomponent = {};

//=====================================
// Action
//=====================================


/** This creates the command. Both the initial and full names should be passed in 
 * even is they are the same. */
apogeeapp.app.movecomponent.createUndoCommand = function(workspaceUI,commandJson) {
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.lookupMemberByFullName(commandJson.memberFullName);
    var parent = member.getParent();
    var oldMemberName = member.getName();
    var oldParentFullName = parent.getFullName();
    
    var newParent = workspace.lookupMemberByFullName(commandJson.newParentFullName);
    var newMemberFullName = newParent.getChildFullName(commandJson.newMemberName);
    
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.movecomponent.COMMAND_TYPE;
    undoCommandJson.memberFullName = newMemberFullName;
    undoCommandJson.newMemberName = oldMemberName;
    undoCommandJson.newParentFullName = oldParentFullName;
    
    return undoCommandJson;
}

apogeeapp.app.movecomponent.executeCommand = function(workspaceUI,commandJson) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionData = {};
    actionData.action = "moveMember";
    actionData.memberName = commandJson.memberFullName;
    actionData.targetName = commandJson.newMemberName;
    actionData.targetOwnerName = commandJson.newParentFullName;
    var actionResult = apogee.action.doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
    
}

apogeeapp.app.movecomponent.COMMAND_TYPE = "moveComponent";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.movecomponent);


