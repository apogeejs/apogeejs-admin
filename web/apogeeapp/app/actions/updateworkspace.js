apogeeapp.app.updateworkspace = {};

//=====================================
// Action
//=====================================

apogeeapp.app.updateworkspace.createUpdatePropertyValuesCommand = function(workspaceUI,oldValues,newValues) {
    var command = {};
    command.cmd = () => apogeeapp.app.updateworkspace.doUpdatePropertyValues(workspaceUI,oldValues,newValues);
    command.undoCmd = () => apogeeapp.app.updateworkspace.doUpdatePropertyValues(workspaceUI,newValues,oldValues);
    command.desc = "Update workspace properties"
    return command;
}


/** This method is used for updating property values from the property dialog. */
apogeeapp.app.updateworkspace.doUpdatePropertyValues = function(workspaceUI,oldValues,newValues) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionResponse = new apogee.ActionResponse();
    
    //check if rename is needed
    if(oldValues.name !== newValues.name) {
        var actionData;
        actionData = {};
        actionData.action = "updateWorkspace";
        actionData.workspace = workspace;
        actionData.name = newValues.name;
        
        actionResponse = apogee.action.doAction(actionData,true,actionResponse);
    }
    
    //update any workspace ui properties here
        
    return actionResponse;
}












