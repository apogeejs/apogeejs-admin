/** Update Workspace Command
 *
 * Command JSON format:
 * {
 *   "type":"updateWorkspace",
 *   "updatedCoreProperties":(member property json), //name only
 *   "updatedAppProperties":(component property json) //currently not used
 * }
 */ 
apogeeapp.app.updateworkspace = {};

//=====================================
// Action
//=====================================

apogeeapp.app.updateworkspace.createUndoCommand = function(workspaceUI,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.updateworkspace.COMMAND_TYPE;
    
    //right now we assume this is just a name update
    var workspace = workspaceUI.getWorkspace();
    undoCommandJson.updatedCoreProperties = {};
    undoCommandJson.updatedCoreProperties.name = workspace.getName();
    
    return undoCommandJson;
}

apogeeapp.app.updateworkspace.executeCommand = function(workspaceUI,commandData) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionResult;    
    var actionData;
    actionData = {};
    actionData.action = apogee.updateworkspace.ACTION_NAME;
    actionData.workspace = workspace;
    actionData.properties = commandData.updatedCoreProperties;

    actionResult = apogee.action.doAction(workspace,actionData);

    //update any workspace ui properties here - none for now
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.updateworkspace.COMMAND_TYPE = "updateWorkspace";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.updateworkspace);










