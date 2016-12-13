/** This namespace contains the update folder function action */
hax.updatefolderfunction = {};

/** Update folder function action name 
 * Action Data format:
 * {
 *  "action": hax.updatefolderfunction.ACTION_NAME,
 *  "member": (member to move),
 *  "argList": (argument list, as an array of strings)
 *  "returnValueString": (name of the return value table)
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 */
hax.updatefolderfunction.ACTION_NAME = "updateFolderFunction";

/** Update folder function action function */
hax.updatefolderfunction.updateProperties = function(actionData,processedActions) { 
          
    var folderFunction = actionData.member;
    
    folderFunction.setArgList(actionData.argList);
    folderFunction.setReturnValueString(actionData.returnValueString);
    
    processedActions.push(actionData);
}

/** Action info */
hax.updatefolderfunction.ACTION_INFO= {
    "actionFunction": hax.updatefolderfunction.updateProperties,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};


//This line of code registers the action 
hax.action.addActionInfo(hax.updatefolderfunction.ACTION_NAME,hax.updatefolderfunction.ACTION_INFO);

