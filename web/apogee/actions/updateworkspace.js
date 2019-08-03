import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updateWorkspace",
 *  "workspace": (workspace to update),
 *  "properties": (properties to set) //currently only "name"
 * }
 *
 * member UPDATED EVENT: "workspaceUpdated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */

/** Update code action function. */
function updateWorkspace(workspace,actionData,actionResult) { 
    
    var properties = actionData.properties;
    if(properties) {
        if(properties.name) workspace.setName(properties.name);
    }
    
    actionResult.actionDone = true;
}

/** Update data action info */
let ACTION_INFO = {
    "action": "updateWorkspace",
    "actionFunction": updateWorkspace,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": false,
    "event": "workspaceUpdated"
};

//The following code registers the actions
addActionInfo(ACTION_INFO);