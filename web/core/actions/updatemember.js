/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
hax.core.updatemember = {};

/** member UPDATED EVENT
 * This listener event is fired when after a member is updated, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
hax.core.updatemember.MEMBER_UPDATED_EVENT = "memberUpdated";

hax.core.updatemember.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(hax.core.updatemember.MEMBER_UPDATED_EVENT,member);
}

hax.core.updatemember.fireUpdatedEventList = function(memberList) {
    for(var i = 0; i < memberList.length; i++) {
        hax.core.updatemember.fireUpdatedEvent(memberList[i]);
    }
}

/** This method updates the object function for a given member. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.core.updatemember.updateCode = function(member,argList,functionBody,supplementalCode,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.core.ActionResponse();
    
    try {
        var recalculateList = [];

        hax.core.updatemember.updateObjectFunction(member,
            argList,
            functionBody,
            supplementalCode,
            recalculateList);

        hax.core.calculation.callRecalculateList(recalculateList,actionResponse);
        
        //fire updated events
        hax.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = hax.core.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This method updates the data for a given member. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.core.updatemember.updateData = function(member,data,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.core.ActionResponse();
    
    try {
        var recalculateList = [];

        hax.core.updatemember.updateObjectData(member,data,recalculateList);

        hax.core.calculation.callRecalculateList(recalculateList,actionResponse);

        //fire updated events
        hax.core.updatemember.fireUpdatedEvent(member);
        hax.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = hax.core.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This method updates the object function or the data for a list of members. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.core.updatemember.updateObjects = function(updateDataList,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.core.ActionResponse();
    
    try {
        var recalculateList = [];
        var setDataList = [];

        hax.core.updatemember.updateObjectFunctionOrData(updateDataList,
            recalculateList,
            setDataList); 

        hax.core.calculation.callRecalculateList(recalculateList,actionResponse);

        //fire updated events
        hax.core.updatemember.fireUpdatedEventList(setDataList);
        hax.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = hax.core.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

//=====================================
// Private Functions
//=====================================

hax.core.updatemember.updateObjectFunctionOrData = function(updateDataList,
        recalculateList,
        setDataList) {  
     
    for(var i = 0; i < updateDataList.length; i++) {
        var argData = updateDataList[i];
        var member = argData.member;
        var data = argData.data;
        var argList = argData.argList; 
        var functionBody = argData.functionBody;
        var supplementalCode = argData.supplementalCode;
        
        if(functionBody) {
            hax.core.updatemember.updateObjectFunction(member,
                argList,
                functionBody,
                supplementalCode,
                recalculateList);
        }
        else if(data) {
            hax.core.updatemember.updateObjectData(member,
                data,
                recalculateList);
            
            setDataList.push(member);
        }
    }
}

/** This method updates the code and object function in a member based on the
 * passed code.*/
hax.core.updatemember.updateObjectFunction = function(codeable,
        argList,
        functionBody,
        supplementalCode,
        recalculateList) {
    
    //process the code
    var codeInfo ={};
    codeInfo.argList = argList;
    codeInfo.functionBody = functionBody;
    codeInfo.supplementalCode = supplementalCode;
        
    //load some needed context variables
    var contextManager = codeable.getContextManager();
    var codeLabel = codeable.getFullName();

    //process the code text into javascript code
    hax.core.codeCompiler.processCode(codeInfo,
        contextManager,
        codeLabel);

    //save the code
    codeable.setCodeInfo(codeInfo);
    
	//update recalculate list
    hax.core.calculation.addToRecalculateList(recalculateList,codeable);
}


/** This method sets the data for a member. */
hax.core.updatemember.updateObjectData = function(dataHolder,
        data,
        recalculateList) {
    
    dataHolder.clearErrors();
    //clear the code if this is a codeable object
    if(dataHolder.isCodeable) {
        dataHolder.clearCode();
    }
    
    dataHolder.setData(data);
    
    hax.core.calculation.addToRecalculateList(recalculateList,dataHolder);
}



