apogeeapp.app.updateworkspace = {};

//=====================================
// Action
//=====================================

apogeeapp.app.updateworkspace.createUpdatePropertyValuesCommand = function(workspaceUI,oldValues,newValues) {
    var command = {};
    command.cmd = () => apogeeapp.app.updateworkspace.doUpdatePropertyValues(workspaceUI,oldValues,newValues);
    command.undoCmd = () => apogeeapp.app.updateworkspace.doUpdatePropertyValues(workspaceUI,newValues,oldValues);
    command.desc = "Update workspace properties"
    command.setsDirty = true;
    return command;
}


/** This method is used for updating property values from the property dialog. */
apogeeapp.app.updateworkspace.doUpdatePropertyValues = function(workspaceUI,oldValues,newValues) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionResult;
    
    //check if rename is needed
    if(oldValues.name !== newValues.name) {
        var actionData;
        actionData = {};
        actionData.action = apogee.updateworkspace.ACTION_NAME;
        actionData.workspace = workspace;
        actionData.name = newValues.name;
        
        actionResult = apogee.action.doAction(workspace,actionData);
    }
    
    //update any workspace ui properties here
        
    if(actionResult) {
        if(actionResult.alertMsg) apogeeapp.app.CommandMessenger.errorAlert(actionResult.alertMsg);
        return actionResult.actionDone;
    }
    else {
        return true;
    }
}












