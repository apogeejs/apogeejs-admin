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

hax.updatemember.CODE_APPLIED = 0;
hax.updatemember.DATA_APPLIED = 1;

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
        var recalculateList = [];

        hax.updatemember.applyCode(member,
            argList,
            functionBody,
            supplementalCode,
            recalculateList);
            
        //set dependencies
        member.initializeDependencies();
            
        hax.calculation.addToRecalculateList(recalculateList,member);

        hax.calculation.callRecalculateList(recalculateList,actionResponse);
        
        //fire updated events
        hax.updatemember.fireUpdatedEventList(recalculateList);
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
        var recalculateList = [];

        hax.updatemember.applyData(member,data);
        
        hax.calculation.addToRecalculateList(recalculateList,member);

        hax.calculation.callRecalculateList(recalculateList,actionResponse);

        //fire updated events
        hax.updatemember.fireUpdatedEvent(member);
        hax.updatemember.fireUpdatedEventList(recalculateList);
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
        var recalculateList = [];

        //apply data without clearing formula
        hax.updatemember.asynchFunctionApplyData(member,data);
        member.setResultPending(false);
        
        //add all dependents to list without adding this object
        if(member.isDataHolder) {
            var impactsList = member.getImpactsList();
            for(var i = 0; i < impactsList.length; i++) {
                hax.calculation.addToRecalculateList(recalculateList,impactsList[i]);
            }
        }

        hax.calculation.callRecalculateList(recalculateList,actionResponse);

        //fire updated events
        hax.updatemember.fireUpdatedEvent(member);
        hax.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = hax.ActionError.processException(error,"AppException",true);
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
        var recalculateList = [];   
        var setDataList = [];
             
        //process each member in the list
        for(var i = 0; i < updateDataList.length; i++) {
            var argData = updateDataList[i];
            var member = argData.member;
            
            var codeOrData = hax.updatemember.applyCodeOrData(member,argData);
            
            //if this is code we need to initialize
            //set dependencies
            if(codeOrData === hax.updatemember.CODE_APPLIED) {
                member.initializeDependencies();
            }
            else {
                setDataList.push(member);
            }
            
            //update recalculate list
            hax.calculation.addToRecalculateList(recalculateList,member);
        }

        //recalculate after all have been added
        hax.calculation.callRecalculateList(recalculateList,actionResponse);

        //fire updated events
        hax.updatemember.fireUpdatedEventList(setDataList);
        hax.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

//=====================================
// Private Functions
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
        return hax.updatemember.CODE_APPLIED;
    }
    else if(data !== undefined) {
        hax.updatemember.applyData(member,
            data);
        return hax.updatemember.DATA_APPLIED;
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

/** This method sets the data for a member. */
hax.updatemember.applyData = function(dataHolder,data) {
    
    dataHolder.clearErrors();
    //clear the code if this is a codeable object
    if(dataHolder.isCodeable) {
        dataHolder.clearCode();
    }
    
    dataHolder.setData(data);
}

/* This method sets the data on the return os an asynchronous formula. It 
 * is the same as apply data except it does not clear the code. */
hax.updatemember.asynchFunctionApplyData = function(dataHolder,data) {
    dataHolder.clearErrors();
    dataHolder.setData(data);
}



