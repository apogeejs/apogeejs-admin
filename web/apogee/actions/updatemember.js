/** This namespace contains the update member actions */
apogee.updatemember = {};

/** Update data action name 
 * Action Data format:
 * {
 *  "action": apogee.updatemember.UPDATE_DATA_ACTION_NAME,
 *  "member": (member to update),
 *  "data": (new value for the table)
 *  "sourcePromise": (OPTIONAL - If this is the completion of an asynchronous action, the
 *      source promise shoudl be included to make sure it has not been overwritten with a
 *      more recent operation.)
 *  "promiseRefresh": (OPTIONAL - If this action reinstates a previously set promise,
 *      this flag will prevent setting additional then/catch statements on the promise)
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
 *  "action": apogee.updatemember.UPDATE_ERROR_ACTION_NAME,
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
apogee.updatemember.updateCode = function(actionData,processedActions) { 
    
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

/** Update data action function. */
apogee.updatemember.updateData = function(actionData,processedActions) {
    
    if(!actionData.member.getSetDataOk()) {
        throw new Error("can not set data on member: " + member.getFullName());
    }
        
    var member = actionData.member;
    var data = actionData.data;
    
    //if this is the resolution (or rejection) of a previously set promise
    var optionalSourcePromise = actionData.sourcePromise ? actionData.sourcePromise : undefined;
    if(actionData.sourcePromise) {
        if(member.pendingPromiseMatches(actionData.sourcePromise)) {
            //this is the reoslution of pending data
            member.setResultPending(false);
        }
        else {
            //no action - this is from an asynch action that has been overwritten
            return;
        }
    }
    
    //some cleanup for new data
    member.clearErrors();
    if(member.isCodeable) {
        //clear the code - so the data is used
        member.clearCode();
    }
    
    //handle four types of data inputs
    if(data instanceof Promise) {
        //data is a promise - will be updated asynchromously
        
        //check if this is only a refresh
        var optionalPromiseRefresh = actionData.promiseRefresh ? true : false;
        
        apogee.updatemember.applyPromiseData(member,data,optionalPromiseRefresh);
    }
    else if(data instanceof Error) {
        //data is an error
        apogee.updatemember.applyErrorData(member,data);
    }
    else if(data === apogee.util.INVALID_VALUE) {
        //data is an invalid value
        apogee.updatemember.applyInvalidData(member,data);
    }
    else {
        //normal data update (poosibly from an asynchronouse update)
        apogee.updatemember.applyData(member,data);
    }
    
    processedActions.push(actionData);
}

/** Update asynch data action function */
apogee.updatemember.updateDataPending = function(actionData,processedActions) {
	
    var member = actionData.member;
    var promise = actionData.promise;
    
    member.setResultPending(true,promise);
    
    processedActions.push(actionData);
}

/** Asynch function update data action function (resulting from code) */
apogee.updatemember.asynchFunctionUpdateData = function(actionData,processedActions) {
    
    if(!actionData.member.getSetCodeOk()) {
        throw new Error("can not set code on member: " + member.getFullName());
    }
        
    var member = actionData.member;
    var promise = actionData.promise;

    if(member.pendingPromiseMatches(promise)) {
        //apply the data but DO NOT clear the code (this is an asymch update to a coded member)
        apogee.updatemember.applyData(member,actionData.data);
        member.setResultPending(false);

        processedActions.push(actionData);
    }
}

/** Update asynch error action function. */
apogee.updatemember.asynchFunctionUpdateError = function(actionData,processedActions) {

    var member = actionData.member;
    var promise = actionData.promise;
    
    if(member.pendingPromiseMatches(promise)) {
        //set the error flag
        var actionError = new apogee.ActionError(actionData.errorMsg,apogee.ActionError.ERROR_TYPE_MODEL,member);
        member.addError(actionError);
        member.setResultPending(false);

        processedActions.push(actionData);
    }
        
}

/** Update description */
apogee.updatemember.updateDescription = function(actionData,processedActions) {
        
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
    member.setData(data);  
}

apogee.updatemember.applyPromiseData = function(member,promise,optionalPromiseRefresh) {
    //set the result as pending
    member.setResultPending(true,promise);

    //kick off the asynch update, if this is not only a refresh of the promise
    if(!optionalPromiseRefresh) {
        var asynchCallback = function(memberValue) {
            //set the data for the table, along with triggering updates on dependent tables.
            let actionData = {};
            actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
            actionData.member = member;
            actionData.sourcePromise = promise;
            actionData.data = memberValue;
            let actionResponse =  apogee.action.doAction(actionData,true);
        }
        var asynchErrorCallback = function(errorMsg) {
            let actionData = {};
            actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
            actionData.member = member;
            actionData.sourcePromise = promise;
            actionData.data = new Error(errorMsg);
            let actionResponse =  apogee.action.doAction(actionData,true);
        }

        //call appropriate action when the promise completes
        promise.then(asynchCallback).catch(asynchErrorCallback);
    }
}

apogee.updatemember.applyErrorData = function(member,error) {
    //set the error flag
    var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_MODEL);
    member.addError(actionError);
}

apogee.updatemember.applyInvalidData = function(member) {
    //value is invalid if return is this predefined value
    member.setResultInvalid(true);
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