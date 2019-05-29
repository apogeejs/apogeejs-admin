/** This namespace contains the update folder function action */
apogee.updatefolderfunction = {};

/** Update folder function action name 
 * Action Data format:
 * {
 *  "action": apogee.updatefolderfunction.ACTION_NAME,
 *  "member": (member to move),
 *  "argList": (argument list, as an array of strings)
 *  "returnValueString": (name of the return value table)
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 */
apogee.updatefolderfunction.ACTION_NAME = "updateFolderFunction";

/** Update folder function action function */
apogee.updatefolderfunction.updateProperties = function(actionData,processedActions) { 
          
    var folderFunction = actionData.member;
    
    folderFunction.setArgList(actionData.argList);
    folderFunction.setReturnValueString(actionData.returnValueString);
    
    processedActions.push(actionData);
}

/** Action info */
apogee.updatefolderfunction.ACTION_INFO= {
    "actionFunction": apogee.updatefolderfunction.updateProperties,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};


//This line of code registers the action 
apogee.action.addActionInfo(apogee.updatefolderfunction.ACTION_NAME,apogee.updatefolderfunction.ACTION_INFO);

