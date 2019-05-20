
/** This method deletes the component and the underlying member. It should be passed
 *  the workspace and the member full name. (We delete by name and workspace to handle
 *  undo/redo cases where the instance of the member changes.)
 */
apogeeapp.app.addcomponent.doDeleteComponent = function(workspace,memberFullName) {
    
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