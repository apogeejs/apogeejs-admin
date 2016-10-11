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

hax.core.updatemember.CODE_APPLIED = 0;
hax.core.updatemember.DATA_APPLIED = 1;

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

        hax.core.updatemember.applyCode(member,
            argList,
            functionBody,
            supplementalCode,
            recalculateList);
            
        //set dependencies
        member.initializeDependencies();
            
        hax.core.calculation.addToRecalculateList(recalculateList,member);

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

        hax.core.updatemember.applyData(member,data,recalculateList);
        
        hax.core.calculation.addToRecalculateList(recalculateList,member);

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
             
        //process each member in the list
        for(var i = 0; i < updateDataList.length; i++) {
            var argData = updateDataList[i];
            var member = argData.member;
            
            var codeOrData = hax.core.updatemember.applyCodeOrData(member,argData);
            
            //if this is code we need to initialize
            //set dependencies
            if(codeOrData === hax.core.updatemember.CODE_APPLIED) {
                member.initializeDependencies();
            }
            else {
                setDataList.push(member);
            }
            
            //update recalculate list
            hax.core.calculation.addToRecalculateList(recalculateList,member);
        }

        //recalculate after all have been added
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

hax.core.updatemember.applyCodeOrData = function(member,updateData) {
    var data = updateData.data;
    var argList = updateData.argList; 
    var functionBody = updateData.functionBody;
    var supplementalCode = updateData.supplementalCode;

    if(functionBody !== undefined) {
        hax.core.updatemember.applyCode(member,
            argList,
            functionBody,
            supplementalCode);
        return hax.core.updatemember.CODE_APPLIED;
    }
    else if(data !== undefined) {
        hax.core.updatemember.applyData(member,
            data);
        return hax.core.updatemember.DATA_APPLIED;
    }
}
/** This method updates the code and object function in a member based on the
 * passed code.*/
hax.core.updatemember.applyCode = function(codeable,argList,functionBody,supplementalCode) {
    
    var codeInfo ={};
    codeInfo.argList = argList;
    codeInfo.functionBody = functionBody;
    codeInfo.supplementalCode = supplementalCode;
    
    //load some needed context variables
    var codeLabel = codeable.getFullName();
    
    //process the code text into javascript code
    hax.core.codeCompiler.processCode(codeInfo,
        codeLabel);

    //save the code
    codeable.setCodeInfo(codeInfo);
}

/** This method sets the data for a member. */
hax.core.updatemember.applyData = function(dataHolder,data) {
    
    dataHolder.clearErrors();
    //clear the code if this is a codeable object
    if(dataHolder.isCodeable) {
        dataHolder.clearCode();
    }
    
    dataHolder.setData(data);
}



