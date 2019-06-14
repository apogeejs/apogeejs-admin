apogeeapp.app.deletecomponent = {};


/** This function creates a command to delete a component. */
apogeeapp.app.deletecomponent.createDeleteComponentCommand = function(component) {
    
    var member = component.getMember();
    
    //get the delete command;
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    
    var deleteFunction = () => apogeeapp.app.deletecomponent.doDeleteComponent(workspace,memberFullName);
    
    //get the un-delete command
    var workspaceUI = component.getWorkspaceUI();
    var parent = member.getParent();
    var parentFullName = parent.getFullName();
    var componentGenerator = component.componentGenerator;
    var componentJson = component.toJson();
    var memberJson = member.toJson();
    
    //need to add optionalOnSuccess for LiteratePage!!!
    var optionalOnSuccess = undefined;
    
    var createFunction = () => apogeeapp.app.addcomponent.doAddComponent(workspaceUI,parentFullName,componentGenerator,memberJson,componentJson,optionalOnSuccess); 
    
    var command = {};
    command.cmd = deleteFunction;
    command.undoCmd = createFunction;
    command.desc = "Delete member: " + member.getFullName();
    command.setsDirty = true;
    
    return command;
}

/** This method deletes the component and the underlying member. It should be passed
 *  the workspace and the member full name. (We delete by name and workspace to handle
 *  undo/redo cases where the instance of the member changes.)
 */
apogeeapp.app.deletecomponent.doDeleteComponent = function(workspace,memberFullName) {

    var json = {};
    json.action = "deleteMember";
    json.memberName = memberFullName;
    var actionResult = apogee.action.doAction(workspace,json);
    
    if(actionResult.alertMsg) {
        apogeeapp.app.CommandManager.errorAlert(actionResult.alertMsg);
    }
    
    return actionResult.actionDone;
}