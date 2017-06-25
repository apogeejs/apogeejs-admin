/** This namespace contains the compound action */
apogee.compoundaction = {};

/** Compound action name 
 * Action Data format:
 * {
 *  "action": apogee.compoundaction.ACTION_NAME,
 *  "workspace":the workspace object
 *  "actions": (list of actions in this compound action),
 * }
 */
apogee.compoundaction.ACTION_NAME = "compoundAction";

/** This method is the action function for a compound action. */
apogee.compoundaction.compoundActionFunction = function(actionData,optionalContext,processedActions) {

    var actionList = actionData.actions;
    for(var i = 0; i < actionList.length; i++) {
        var childActionData = actionList[i];
        apogee.action.callActionFunction(childActionData,optionalContext,processedActions);
    }
}

/** Action info */
apogee.compoundaction.ACTION_INFO = {
    "actionFunction": apogee.compoundaction.compoundActionFunction,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "event": null
}


//This line of code registers the action 
apogee.action.addActionInfo(apogee.compoundaction.ACTION_NAME,apogee.compoundaction.ACTION_INFO);