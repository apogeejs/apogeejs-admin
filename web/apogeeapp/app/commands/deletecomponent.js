apogeeapp.app.deletecomponent = {};

//=====================================
// Command Object
//=====================================

apogeeapp.app.deletecomponent.createUndoCommand = function(workspaceUI,commandJson) {
    
    //problems
    // - is this member a component main member?
    // - is there a parent, or just an owner
    
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.getMemberByFullName(commandJson.memberFullName);
    var component = workspaceUI.getComponent(member);
    var parent = member.getParent();
    
    var commandUndoJson = {};
    commandUndoJson.type = apogeeapp.app.addcomponent.COMMAND_TYPE;
    commandUndoJson.parentFullName = parent.getFullName();
    commandUndoJson.memberJson = member.toJson();
    commandUndoJson.componentJson = component.toJson();
    
    return commandUndoJson;
}

/** This method deletes the component and the underlying member. It should be passed
 *  the workspace and the member full name. (We delete by name and workspace to handle
 *  undo/redo cases where the instance of the member changes.)
 */
apogeeapp.app.deletecomponent.executeCommand = function(workspaceUI,commandJson) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionJson = {};
    actionJson.action = "deleteMember";
    actionJson.memberName = commandJson.memberFullName;
    
    var actionResult = apogee.action.doAction(workspace,actionJson);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.deletecomponent.COMMAND_TYPE = "deleteComponent";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.deletecomponent);