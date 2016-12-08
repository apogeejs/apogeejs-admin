/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
hax.updatemember = {};

/** member UPDATED EVENT
 * This listener event is fired when after a member is updated, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
hax.updatemember.MEMBER_UPDATED_EVENT = "memberUpdated";

hax.updatemember.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(hax.updatemember.MEMBER_UPDATED_EVENT,member);
}

hax.updatemember.fireUpdatedEventList = function(memberList) {
    for(var i = 0; i < memberList.length; i++) {
        hax.updatemember.fireUpdatedEvent(memberList[i]);
    }
}

/** This method updates the object function for a given member. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.updatemember.updateCode = function(member,argList,functionBody,supplementalCode,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.ActionResponse();
    
    try {
        var completedActions = hax.action.createCompletedActionsObject();
        
        hax.updatemember.applyCode(member,
            argList,
            functionBody,
            supplementalCode);
            
        hax.action.addAction(completedActions,member,"updateCode");
            
        var workspace = member.getWorkspace();
        hax.action.finalizeAction(workspace,completedActions,actionResponse);
    }
    catch(error) {
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This method updates the data for a given member. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.updatemember.updateData = function(member,data,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.ActionResponse();
    
    try {
        var completedActions = hax.action.createCompletedActionsObject();
        
        hax.updatemember.applyData(member,data);
        
        //clear the code - so the data is used
        if(member.isCodeable) {
            member.clearCode();
        }
        
        hax.action.addAction(completedActions,member,"updateData");
        
        var workspace = member.getWorkspace();
        hax.action.finalizeAction(workspace,completedActions,actionResponse);
    }
    catch(error) {
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This method is used to update the value of a member on the return of an asynchrronous
 * formula. */
hax.updatemember.asynchFunctionUpdateData = function(member,data) {
	var actionResponse = new hax.ActionResponse();
    
    try {
        var completedActions = hax.action.createCompletedActionsObject();
        
        //apply data without clearing formula
        hax.updatemember.asynchFunctionApplyData(member,data);
        member.setResultPending(false);
        
        hax.action.addAction(completedActions,member,"asynchUpdateData");
        
        var workspace = member.getWorkspace();
        hax.action.finalizeAction(workspace,completedActions,actionResponse);
    }
    catch(error) {
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

hax.updatemember.asynchFunctionUpdateError = function(member,errorMsg) {
    var actionResponse = new hax.ActionResponse();
    var actionError;
    
    try {
        var completedActions = hax.action.createCompletedActionsObject();
        
        //apply data without clearing formula
        actionError = new hax.ActionError(errorMsg,"Codeable - Calculate",member);
        member.addError(actionError);
        actionResponse.addError(actionError);
        member.setResultPending(false);
        
        hax.action.addAction(completedActions,member,"asynchUpdateError");
        
        var workspace = member.getWorkspace();
        hax.action.finalizeAction(workspace,completedActions,actionResponse);
    }
    catch(error) {
        actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This method updates the object function or the data for a list of members. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.updatemember.updateObjects = function(updateDataList,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.ActionResponse();
    
    try {
        var completedActions = hax.action.createCompletedActionsObject();
             
        //process each member in the list
        for(var i = 0; i < updateDataList.length; i++) {
            var argData = updateDataList[i];
            var member = argData.member;
            
            var codeOrData = hax.updatemember.applyCodeOrData(member,argData);
            hax.action.addAction(completedActions,member,codeOrData);
        }

        var workspace = member.getWorkspace();
        hax.action.finalizeAction(workspace,completedActions,actionResponse);
    }
    catch(error) {
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

//=====================================
// Private and Internal Functions
//=====================================

hax.updatemember.applyCodeOrData = function(member,updateData) {
    var data = updateData.data;
    var argList = updateData.argList; 
    var functionBody = updateData.functionBody;
    var supplementalCode = updateData.supplementalCode;

    if(functionBody !== undefined) {
        hax.updatemember.applyCode(member,
            argList,
            functionBody,
            supplementalCode);
        return "updateCode";
    }
    else if(data !== undefined) {
        hax.updatemember.applyData(member,
            data);
        return "updateData";
    }
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

/** This method sets the data for a member. 
 * @private */
hax.updatemember.applyData = function(dataHolder,data) {
    dataHolder.clearErrors();
    dataHolder.setData(data);
}



