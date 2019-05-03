/** This namespace contains the update member actions */
apogee.updatemember = {};

/** Update data action name 
 * Action Data format:
 * {
 *  "action": apogee.updatemember.UPDATE_DATA_ACTION_NAME,
 *  "member": (member to update),
 *  "data": (new value for the table)
 * }
 */
apogee.updatemember.UPDATE_DATA_ACTION_NAME = "updateData";

/** Update code action name 
 * Action Data format:
 * {
 *  "action": apogee.updatemember.UPDATE_CODE_ACTION_NAME,
 *  "member": (member to update),
 *  "argList": (arg list for the table)
 *  "functionBody": (function body for the table)
 *  "supplementalCode": (supplemental code for the table)
 * }
 */
apogee.updatemember.UPDATE_CODE_ACTION_NAME = "updateCode";

/** Update data pending action name 
 * Action Data format:
 * {
 *  "action": apogee.updatemember.UPDATE_DATA_PENDING_ACTION_NAME,
 *  "member": (member to update),
 * }
 */
apogee.updatemember.UPDATE_DATA_PENDING_ACTION_NAME = "updateDataPending"

/** Update asynch data action name - used for updating data after an asynchronous formula
 * Action Data format:
 * {
 *  "action": apogee.updatemember.UPDATE_ASYNCH_DATA_ACTION_NAME,
 *  "member": (member to update),
 *  "data": (new value for the table)
 * }
 */
apogee.updatemember.UPDATE_ASYNCH_DATA_ACTION_NAME = "asynchFormulaData";

/** Update asynch error action name - used for publishing an error after an asynchronous formula
 * Action Data format:
 * {
 *  "action": apogee.updatemember.UPDATE_DATA_ACTION_NAME,
 *  "member": (member to update),
 *  "errorMsg": (new value for the table)
 * }
 */
apogee.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME = "updateError";

/** Update description action name - used for publishing an error after an asynchronous formula
 * Action Data format:
 * {
 *  "action": apogee.updatemember.UPDATE_DESCRIPTION_ACTION_NAME,
 *  "member": (member to update),
 *  "description": (description)
 * }
 */
apogee.updatemember.UPDATE_DESCRIPTION_ACTION_NAME = "updateDescription";

/** member UPDATED EVENT
 * Event member format:
 * {
 *  "member": (member)
 * }
 */
apogee.updatemember.MEMBER_UPDATED_EVENT = "memberUpdated";

/** Update code action function. */
apogee.updatemember.updateCode = function(actionData,optionalContext,processedActions) { 
    
    var member = actionData.member;
    if((!member.isCodeable)||(!member.getSetCodeOk())) {
        throw new Error("can not set code on member: " + member.getFullName());
    }
          
    apogee.updatemember.applyCode(actionData.member,
        actionData.argList,
        actionData.functionBody,
        actionData.supplementalCode);
        
    processedActions.push(actionData);
}

/** Update data action function */
apogee.updatemember.updateData = function(actionData,optionalContext,processedActions) {
    
    if(!actionData.member) {
        apogee.updatemember.loadMemberName(actionData,optionalContext);
    }
    
    if(!actionData.member.getSetDataOk()) {
        throw new Error("can not set data on member: " + member.getFullName());
    }
        
    var member = actionData.member;

    apogee.updatemember.applyData(member,actionData.data);

    //clear the code - so the data is used
    if(member.isCodeable) {
        member.clearCode();
    }
    
    processedActions.push(actionData);
}

/** Update asynch data action function */
apogee.updatemember.updateDataPending = function(actionData,optionalContext,processedActions) {
    
    if(!actionData.member) {
        apogee.updatemember.loadMemberName(actionData,optionalContext);
    }
	
    var member = actionData.member;
    var token = actionData.token;
    
    member.setResultPending(true,token);
    
    processedActions.push(actionData);
}

/** Asynch function update data action function (resulting from code) */
apogee.updatemember.asynchFunctionUpdateData = function(actionData,optionalContext,processedActions) {
    
    if(!actionData.member.getSetCodeOk()) {
        throw new Error("can not set code on member: " + member.getFullName());
    }
        
    var member = actionData.member;
    var token = actionData.token;

    if(member.pendingTokenMatches(token)) {
        //apply the data but DO NOT clear the code (this is an asymch update to a coded member)
        apogee.updatemember.applyData(member,actionData.data);
        member.setResultPending(false);

        processedActions.push(actionData);
    }
}

/** Update asynch error action function. */
apogee.updatemember.asynchFunctionUpdateError = function(actionData,optionalContext,processedActions) {
    
    if(!actionData.member) {
        apogee.updatemember.loadMemberName(actionData,optionalContext);
    }

    var member = actionData.member;
    var token = actionData.token;
    
    if(member.pendingTokenMatches(token)) {
        //set the error flag
        var actionError = new apogee.ActionError(actionData.errorMsg,"Codeable - Calculate",member);
        member.addError(actionError);
        member.setResultPending(false);

        processedActions.push(actionData);
    }
        
}

/** Update description */
apogee.updatemember.updateDescription = function(actionData,optionalContext,processedActions) {
        
    var member = actionData.member;

    member.setDescription(actionData.description);
    
    processedActions.push(actionData);
}


/** This method updates the code and object function in a member based on the
 * passed code.*/
apogee.updatemember.applyCode = function(codeable,argList,functionBody,supplementalCode) {
    
    var codeInfo ={};
    codeInfo.argList = argList;
    codeInfo.functionBody = functionBody;
    codeInfo.supplementalCode = supplementalCode;
    
    //load some needed context variables
    var codeLabel = codeable.getFullName();
    
    //process the code text into javascript code
    var compiledInfo = apogee.codeCompiler.processCode(codeInfo,
        codeLabel);

    //save the code
    codeable.setCodeInfo(codeInfo,compiledInfo);
}

/** This method sets the data for a member. */
apogee.updatemember.applyData = function(member,data) {
    member.clearErrors();
    member.setData(data);
}

/** Update code action function. */
apogee.updatemember.loadMemberName = function(actionData,context) { 
    
    if(actionData.memberName) {
        var path = actionData.memberName.split(".");
        actionData.member = context.getMember(path);
    }
    if(!actionData.member) {
        throw new Error("Member not found for action: " + actionData.action);
    }
}


/** Update data action info */
apogee.updatemember.UPDATE_DATA_ACTION_INFO = {
    "actionFunction": apogee.updatemember.updateData,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};
/** Update code action info */
apogee.updatemember.UPDATE_CODE_ACTION_INFO = {
    "actionFunction": apogee.updatemember.updateCode,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};
apogee.updatemember.UPDATE_DATA_PENDING_ACTION_INFO = {
    "actionFunction": apogee.updatemember.updateDataPending,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};
/** Update asynch data action info */
apogee.updatemember.UPDATE_ASYNCH_DATA_ACTION_INFO = {
    "actionFunction": apogee.updatemember.asynchFunctionUpdateData,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};
/** Update asynch error action info */
apogee.updatemember.UPDATE_ASYNCH_ERROR_ACTION_INFO = {
    "actionFunction": apogee.updatemember.asynchFunctionUpdateError,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};
/** Update data action info */
apogee.updatemember.UPDATE_DESCRIPTION_ACTION_INFO = {
    "actionFunction": apogee.updatemember.updateDescription,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": false,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};


//The following code registers the actions
apogee.action.addActionInfo(apogee.updatemember.UPDATE_DATA_ACTION_NAME,apogee.updatemember.UPDATE_DATA_ACTION_INFO);
apogee.action.addActionInfo(apogee.updatemember.UPDATE_CODE_ACTION_NAME,apogee.updatemember.UPDATE_CODE_ACTION_INFO);
apogee.action.addActionInfo(apogee.updatemember.UPDATE_DATA_PENDING_ACTION_NAME,apogee.updatemember.UPDATE_DATA_PENDING_ACTION_INFO);
apogee.action.addActionInfo(apogee.updatemember.UPDATE_ASYNCH_DATA_ACTION_NAME,apogee.updatemember.UPDATE_ASYNCH_DATA_ACTION_INFO);
apogee.action.addActionInfo(apogee.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME,apogee.updatemember.UPDATE_ASYNCH_ERROR_ACTION_INFO);
apogee.action.addActionInfo(apogee.updatemember.UPDATE_DESCRIPTION_ACTION_NAME,apogee.updatemember.UPDATE_DESCRIPTION_ACTION_INFO);