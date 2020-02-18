import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updateModel",
 *  "model": (model to update),
 *  "properties": (properties to set) //currently only "name"
 * }
 *
 * member UPDATED EVENT: "modelUpdated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */

/** Update code action function. */
function updateModel(model,actionData) { 

    let actionResult = {};
    actionResult.actionInfo = ACTION_INFO;
    
    var properties = actionData.properties;
    if(properties) {
        if(properties.name) model.setName(properties.name);
    }
    
    actionResult.actionDone = true;

    return actionResult;
}

/** Update data action info */
let ACTION_INFO = {
    "action": "updateModel",
    "actionFunction": updateModel,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": false,
    "event": "modelUpdated"
};

//The following code registers the actions
addActionInfo(ACTION_INFO);