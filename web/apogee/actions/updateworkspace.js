/** This namespace contains the update member actions */
apogee.updateworkspace = {};

/** Update workspace action name 
 * Action Data format:
 * {
 *  "action": apogee.updateworkspace.ACTION_NAME,
 *  "workspace": (workspace to update),
 *  "name": (new name)
 * }
 */
apogee.updateworkspace.ACTION_NAME = "updateWorkspace";


/** member UPDATED EVENT
 * Event member format:
 * {
 *  "member": (member)
 * }
 */
apogee.updateworkspace.WORKSPACE_UPDATED_EVENT = "workspaceUpdated";

/** Update code action function. */
apogee.updateworkspace.updateWorkspace = function(workspace,actionData,actionResult) { 
    
    workspace.setName(actionData.name);
        
    actionResult.actionDone = true;
}

/** Update data action info */
apogee.updateworkspace.UPDATE_WORKSPACE_ACTION_INFO = {
    "action": apogee.updateworkspace.ACTION_NAME,
    "actionFunction": apogee.updateworkspace.updateWorkspace,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": false,
    "event": apogee.updateworkspace.WORKSPACE_UPDATED_EVENT
};

//The following code registers the actions
apogee.action.addActionInfo(apogee.updateworkspace.ACTION_NAME,apogee.updateworkspace.UPDATE_WORKSPACE_ACTION_INFO);