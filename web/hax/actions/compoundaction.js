/** This namespace contains the create member action */
hax.compoundaction = {};

/** Create member action name 
 * Action Data format:
 * {
 *  "action": hax.createmember.ACTION_NAME,
 *  "workspace":the workspace object
 *  "actions": (list of actions in this compound action),
 * }
 */
hax.compoundaction.ACTION_NAME = "compoundAction";

/** This method is the action function for a compound action. */
hax.compoundaction.compoundActionFunction = function(actionData,optionalContext,processedActions) {

    var actionList = actionData.actions;
    for(var i = 0; i < actionList.length; i++) {
        var childActionData = actionList[i];
        hax.action.callActionFunction(childActionData,optionalContext,processedActions);
    }
}

/** Action info */
hax.compoundaction.ACTION_INFO = {
    "actionFunction": hax.compoundaction.compoundActionFunction,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "event": null
}


//This line of code registers the action 
hax.action.addActionInfo(hax.compoundaction.ACTION_NAME,hax.compoundaction.ACTION_INFO);