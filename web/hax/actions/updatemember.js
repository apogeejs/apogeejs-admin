/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
hax.updatemember = {};

/** Create member action */
hax.updatemember.UPDATE_DATA_ACTION_NAME = "updateData";
hax.updatemember.UPDATE_CODE_ACTION_NAME = "updateCode";
hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_NAME = "asynchUpdateData";
hax.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME = "asynchUpdateError";

/** member UPDATED EVENT
 * Event member Format:
 * [member]
 */
hax.updatemember.MEMBER_UPDATED_EVENT = "memberUpdated";

hax.updatemember.UPDATE_DATA_ACTION_INFO = {
    "actionFunction": hax.updatemember.updateData,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};
hax.updatemember.UPDATE_CODE_ACTION_INFO = {
    "actionFunction": hax.updatemember.updateCode,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};
hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_INFO = {
    "actionFunction": hax.updatemember.asynchFunctionUpdateData,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};
hax.updatemember.UPDATE_ASYNCH_ERROR_ACTION_INFO = {
    "actionFunction": hax.updatemember.asynchFunctionUpdateError,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};

hax.action.addEventInfo(hax.updatemember.UPDATE_DATA_ACTION_NAME,hax.updatemember.UPDATE_DATA_ACTION_INFO);
hax.action.addEventInfo(hax.updatemember.UPDATE_CODE_ACTION_NAME,hax.updatemember.UPDATE_CODE_ACTION_INFO);
hax.action.addEventInfo(hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_NAME,hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_INFO);
hax.action.addEventInfo(hax.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME,hax.updatemember.UPDATE_ASYNCH_ERROR_ACTION_INFO);


/** This method updates the object function for a given member. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.updatemember.updateCode = function(actionData,processedActions) { 
          
    hax.updatemember.applyCode(actionData.member,
        actionData.argList,
        actionData.functionBody,
        actionData.supplementalCode);
        
    processedActions.push(actionData);
}

/** This method updates the data for a given member. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.updatemember.updateData = function(actionData,processedActions) {
        
    var member = actionData.member;

    hax.updatemember.applyData(member,actionData.data);

    //clear the code - so the data is used
    if(member.isCodeable) {
        member.clearCode();
    }
    
    processedActions.push(actionData);
}

/** This method is used to update the value of a member on the return of an asynchrronous
 * formula. */
hax.updatemember.asynchFunctionUpdateData = function(actionData,processedActions) {
	
    var member = actionData.member;
        
    //apply data without clearing formula
    hax.updatemember.applyData(member,actionData.data);
    member.setResultPending(false);
    
    processedActions.push(actionData);
}

hax.updatemember.asynchFunctionUpdateError = function(actionData,processedActions) {

    var member = actionData.member;

    //apply data without clearing formula
    var actionError = new hax.ActionError(actionData.errorMsg,"Codeable - Calculate",member);
    member.addError(actionError);
    member.setResultPending(false);
    
    processedActions.push(actionData);
        
}


//=====================================
// Private and Internal Functions
//=====================================

/** This method updates the code and object function in a member based on the
 * passed code.*/
hax.updatemember.applyCode = function(codeable,argList,functionBody,supplementalCode) {
    
    var codeInfo ={};
    codeInfo.argList = argList;
    codeInfo.functionBody = functionBody;
    codeInfo.supplementalCode = supplementalCode;
    
    //load some needed context variables
    var codeLabel = codeable.getFullName();
    
    //process the code text into javascript code
    hax.codeCompiler.processCode(codeInfo,
        codeLabel);

    //save the code
    codeable.setCodeInfo(codeInfo);
}

/** This method sets the data for a member. 
 * @private */
hax.updatemember.applyData = function(dataHolder,data) {
    dataHolder.clearErrors();
    dataHolder.setData(data);
}



