import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updated",
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
    actionResult.event = ACTION_EVENT;
    
    var properties = actionData.properties;
    if(properties) {
        if(properties.name) model.setName(properties.name);
    }
    
    actionResult.actionDone = true;

    return actionResult;
}

let ACTION_EVENT = "updated";

//The following code registers the actions
addActionInfo("updateModel",updateModel);