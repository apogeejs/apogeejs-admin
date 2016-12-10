
hax.updatefolderfunction = {};

hax.updatefolderfunction.ACTION_NAME = "updateFolderFunction";

hax.updatefolderfunction.ACTION_INFO= {
    "actionFunction": hax.updatefolderfunction.updateProperties,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};

hax.action.addEventInfo(hax.updatefolderfunction.ACTION_NAME,hax.updatefolderfunction.ACTION_INFO);


/** This method updates the argument list and the return value
 * for the folder function. */
hax.updatefolderfunction.updateProperties = function(actionData,processedActions) { 
          
    var folderFunction = actionData.member;
    
    folderFunction.setArgList(actionData.argList);
    folderFunction.setReturnValueString(actionData.returnValueString);
    
    processedActions.push(actionData);
}



