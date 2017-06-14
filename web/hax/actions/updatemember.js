/** This namespace contains the update member actions */
hax.updatemember = {};

/** Update data action name 
 * Action Data format:
 * {
 *  "action": hax.updatemember.UPDATE_DATA_ACTION_NAME,
 *  "member": (member to update),
 *  "data": (new value for the table)
 * }
 */
hax.updatemember.UPDATE_DATA_ACTION_NAME = "updateData";

/** Update code action name 
 * Action Data format:
 * {
 *  "action": hax.updatemember.UPDATE_CODE_ACTION_NAME,
 *  "member": (member to update),
 *  "argList": (arg list for the table)
 *  "functionBody": (function body for the table)
 *  "supplementalCode": (supplemental code for the table)
 * }
 */
hax.updatemember.UPDATE_CODE_ACTION_NAME = "updateCode";

/** Update data pending action name 
 * Action Data format:
 * {
 *  "action": hax.updatemember.UPDATE_DATA_PENDING_ACTION_NAME,
 *  "member": (member to update),
 * }
 */
hax.updatemember.UPDATE_DATA_PENDING_ACTION_NAME = "updateDataPending"

/** Update asynch data action name - used for updating data after an asynchronous formula
 * Action Data format:
 * {
 *  "action": hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_NAME,
 *  "member": (member to update),
 *  "data": (new value for the table)
 * }
 */
hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_NAME = "asynchFormulaData";

/** Update asynch error action name - used for publishing an error after an asynchronous formula
 * Action Data format:
 * {
 *  "action": hax.updatemember.UPDATE_DATA_ACTION_NAME,
 *  "member": (member to update),
 *  "errorMsg": (new value for the table)
 * }
 */
hax.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME = "updateError";

/** Update description action name - used for publishing an error after an asynchronous formula
 * Action Data format:
 * {
 *  "action": hax.updatemember.UPDATE_DESCRIPTION_ACTION_NAME,
 *  "member": (member to update),
 *  "description": (description)
 * }
 */
hax.updatemember.UPDATE_DESCRIPTION_ACTION_NAME = "updateDescription";

/** member UPDATED EVENT
 * Event member format:
 * {
 *  "member": (member)
 * }
 */
hax.updatemember.MEMBER_UPDATED_EVENT = "memberUpdated";

/** Update code action function. */
hax.updatemember.updateCode = function(actionData,optionalContext,processedActions) { 
    
    if(!actionData.member.getSetCodeOk()) {
        throw new Error("can not set code on member: " + member.getFullName());
    }
          
    hax.updatemember.applyCode(actionData.member,
        actionData.argList,
        actionData.functionBody,
        actionData.supplementalCode);
        
    processedActions.push(actionData);
}

/** Update data action function */
hax.updatemember.updateData = function(actionData,optionalContext,processedActions) {
    
    if(!actionData.member) {
        hax.updatemember.loadMemberName(actionData,optionalContext);
    }
    
    if(!actionData.member.getSetDataOk()) {
        throw new Error("can not set data on member: " + member.getFullName());
    }
        
    var member = actionData.member;

    hax.updatemember.applyData(member,actionData.data);

    //clear the code - so the data is used
    if(member.isCodeable) {
        member.clearCode();
    }
    
    processedActions.push(actionData);
}

/** Update asynch data action function */
hax.updatemember.updateDataPending = function(actionData,optionalContext,processedActions) {
    
    if(!actionData.member) {
        hax.updatemember.loadMemberName(actionData,optionalContext);
    }
	
    var member = actionData.member;
    var token = actionData.token;
    
    member.setResultPending(true,token);
    
    processedActions.push(actionData);
}

/** Asynch function update data action function (resulting from code) */
hax.updatemember.asynchFunctionUpdateData = function(actionData,optionalContext,processedActions) {
    
    if(!actionData.member.getSetCodeOk()) {
        throw new Error("can not set code on member: " + member.getFullName());
    }
        
    var member = actionData.member;
    var token = actionData.token;

    if(member.pendingTokenMatches(token)) {
        //apply the data but DO NOT clear the code (this is an asymch update to a coded member)
        hax.updatemember.applyData(member,actionData.data);
        member.setResultPending(false);

        processedActions.push(actionData);
    }
}

/** Update asynch error action function. */
hax.updatemember.asynchFunctionUpdateError = function(actionData,optionalContext,processedActions) {
    
    if(!actionData.member) {
        hax.updatemember.loadMemberName(actionData,optionalContext);
    }

    var member = actionData.member;
    var token = actionData.token;
    
    if(member.pendingTokenMatches(token)) {
        //set the error flag
        var actionError = new hax.ActionError(actionData.errorMsg,"Codeable - Calculate",member);
        member.addError(actionError);
        member.setResultPending(false);

        processedActions.push(actionData);
    }
        
}

/** Update description */
hax.updatemember.updateDescription = function(actionData,optionalContext,processedActions) {
        
    var member = actionData.member;

    member.setDescription(actionData.description);
    
    processedActions.push(actionData);
}


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

/** This method sets the data for a member. */
hax.updatemember.applyData = function(dataHolder,data) {
    dataHolder.clearErrors();
    dataHolder.setData(data);
}

/** Update code action function. */
hax.updatemember.loadMemberName = function(actionData,context) { 
    
    if(actionData.memberName) {
        actionData.member = context.getImpactor(actionData.memberName);
    }
    if(!actionData.member) {
        throw new Error("Member not found for action: " + actionData.action);
    }
}


/** Update data action info */
hax.updatemember.UPDATE_DATA_ACTION_INFO = {
    "actionFunction": hax.updatemember.updateData,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};
/** Update code action info */
hax.updatemember.UPDATE_CODE_ACTION_INFO = {
    "actionFunction": hax.updatemember.updateCode,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};
hax.updatemember.UPDATE_DATA_PENDING_ACTION_INFO = {
    "actionFunction": hax.updatemember.updateDataPending,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};
/** Update asynch data action info */
hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_INFO = {
    "actionFunction": hax.updatemember.asynchFunctionUpdateData,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};
/** Update asynch error action info */
hax.updatemember.UPDATE_ASYNCH_ERROR_ACTION_INFO = {
    "actionFunction": hax.updatemember.asynchFunctionUpdateError,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};
/** Update data action info */
hax.updatemember.UPDATE_DESCRIPTION_ACTION_INFO = {
    "actionFunction": hax.updatemember.updateDescription,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "addDependenceiesToRecalc": false,
    "event": hax.updatemember.MEMBER_UPDATED_EVENT
};


//The following code registers the actions
hax.action.addActionInfo(hax.updatemember.UPDATE_DATA_ACTION_NAME,hax.updatemember.UPDATE_DATA_ACTION_INFO);
hax.action.addActionInfo(hax.updatemember.UPDATE_CODE_ACTION_NAME,hax.updatemember.UPDATE_CODE_ACTION_INFO);
hax.action.addActionInfo(hax.updatemember.UPDATE_DATA_PENDING_ACTION_NAME,hax.updatemember.UPDATE_DATA_PENDING_ACTION_INFO);
hax.action.addActionInfo(hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_NAME,hax.updatemember.UPDATE_ASYNCH_DATA_ACTION_INFO);
hax.action.addActionInfo(hax.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME,hax.updatemember.UPDATE_ASYNCH_ERROR_ACTION_INFO);
hax.action.addActionInfo(hax.updatemember.UPDATE_DESCRIPTION_ACTION_NAME,hax.updatemember.UPDATE_DESCRIPTION_ACTION_INFO);