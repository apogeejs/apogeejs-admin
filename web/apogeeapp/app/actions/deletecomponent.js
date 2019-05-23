apogeeapp.app.deletecomponent = {};


apogeeapp.app.deletecomponent.createDeleteComponentCommand = function(component) {
    
    var member = component.getMember();
    
    //get the delete command;
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    
    var deleteFunction = () => apogeeapp.app.deletecomponent.doDeleteComponent(workspace,memberFullName);
    
    //get the un-delete command
    var workspaceUI = component.getWorkspaceUI();
    var parent = member.getParent();
    var componentGenerator = component.componentGenerator;
    var componentJson = component.toJson();
    var memberJson = member.toJson();
    
    //need to add optionalOnSuccess for LiteratePage!!!
    var optionalOnSuccess = undefined;
    
    var createFunction = () => apogeeapp.app.addcomponent.doAddComponent(workspaceUI,parent,componentGenerator,memberJson,componentJson,optionalOnSuccess); 
    
    var command = {};
    command.cmd = deleteFunction;
    command.undoCmd = createFunction;
    command.desc = "Delete member: " + member.getFullName();
    
    return command;
}

/** This method deletes the component and the underlying member. It should be passed
 *  the workspace and the member full name. (We delete by name and workspace to handle
 *  undo/redo cases where the instance of the member changes.)
 */
apogeeapp.app.deletecomponent.doDeleteComponent = function(workspace,memberFullName) {
    
    var member = workspace.getMemberByFullName(memberFullName);
    var actionResponse;
    
    if(member) {
        //delete the object - the component we be deleted after the delete event received
        var json = {};
        json.action = "deleteMember";
        json.member = member;
        actionResponse = apogee.action.doAction(json,true);
    }
    else {
        var actionResponse = new apogee.ActionResponse();
        var errorMsg = "Error: Member " + memberFullName + " not found.";
        var actionError = new apogee.ActionError(errorMsg,apogee.ActionError.ERROR_TYPE_APP,null);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}