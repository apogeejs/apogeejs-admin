/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.updatemember = {};

/** member UPDATED EVENT
 * This listener event is fired when after a member is updated, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
visicomp.core.updatemember.MEMBER_UPDATED_EVENT = "memberUpdated";

visicomp.core.updatemember.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(visicomp.core.updatemember.MEMBER_UPDATED_EVENT,member);
}

visicomp.core.updatemember.fireUpdatedEventList = function(memberList) {
    for(var i = 0; i < memberList.length; i++) {
        visicomp.core.updatemember.fireUpdatedEvent(memberList[i]);
    }
}

/** This method updates the object function for a given member. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
visicomp.core.updatemember.updateCode = function(member,argList,functionBody,supplementalCode,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    
    try {
        var recalculateList = [];

        var dataSet = visicomp.core.updatemember.updateObjectFunction(member,
            argList,
            functionBody,
            supplementalCode,
            recalculateList);

        var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionResponse);
        
        //fire updated events
        visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = visicomp.core.ActionError.processFatalAppException(error);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This method updates the data for a given member. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
visicomp.core.updatemember.updateData = function(member,data,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    
    try {
        var recalculateList = [];

        var dataSet = visicomp.core.updatemember.updateObjectData(member,
            data,
            recalculateList);

        var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionResponse);

        //fire updated events
        visicomp.core.updatemember.fireUpdatedEvent(member);
        visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = visicomp.core.ActionError.processFatalAppException(error);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This method updates the object function or the data for a list of members. 
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
visicomp.core.updatemember.updateObjects = function(updateDataList,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    
    try {
        var recalculateList = [];
        var setDataList = [];

        visicomp.core.updatemember.updateObjectFunctionOrData(updateDataList,
            recalculateList,
            setDataList); 

        var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionResponse);

        //fire updated events
        visicomp.core.updatemember.fireUpdatedEventList(setDataList);
        visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = visicomp.core.ActionError.processFatalAppException(error);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

//=====================================
// Private Functions
//=====================================

visicomp.core.updatemember.updateObjectFunctionOrData = function(updateDataList,
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
            var uofDataSet = visicomp.core.updatemember.updateObjectFunction(member,
                argList,
                functionBody,
                supplementalCode,
                recalculateList);
        }
        else if(data) {
            var uodDataSet = visicomp.core.updatemember.updateObjectData(member,
                data,
                recalculateList);
            
            setDataList.push(member);
        }
    }
}

/** This method updates the code and object function in a member based on the
 * passed code. It returns true if the data was set and false if there was an
 * error before the data was set. */
visicomp.core.updatemember.updateObjectFunction = function(member,
        argList,
        functionBody,
        supplementalCode,
        recalculateList) {
    
    //process the code
    var codeInfo ={};
    codeInfo.argList = argList;
    codeInfo.functionBody = functionBody;
    codeInfo.supplementalCode = supplementalCode;
        
    var actionError;
   
    try {        
        //load some needed context variables
        var localFolder = member.getParent();
        var rootFolder = member.getRootFolder();
        var codeLabel = member.getFullName();
        var functionName = member.getAllowRecursive() ? member.getName() : "";
    
        //process the code text into javascript code
        visicomp.core.codeCompiler.processCode(codeInfo,
            localFolder,
            rootFolder,
            codeLabel,
            functionName);
    }
    catch(error) {
        //process the error
        actionError = visicomp.core.ActionError.processMemberModelException(error,member);
        member.setCodeError(actionError);
    }
         
    //save the code
    member.setCodeInfo(codeInfo);
    
	//update recalculate list
    visicomp.core.calculation.addToRecalculateList(recalculateList,member);
    
    return true;
}


/** This method sets the data for a member. The return value indicates if the
 * save was done (or at least attempted). */
visicomp.core.updatemember.updateObjectData = function(member,
        data,
        recalculateList) {

    member.setData(data);
    
    //clear the code if this is a codeable object
    if(member.isCodeable) {
        member.clearCode();
    }
    
    visicomp.core.calculation.addToRecalculateList(recalculateList,member);

    //in this method data set is always attempted
    return true;
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.doRecalculate = function(recalculateList,actionResponse) {
     
    //sort list
    var listSorted = visicomp.core.calculation.sortRecalculateList(recalculateList,actionResponse);

    //recalculate list
    //if there is a sort error (ciruclar reference) this will also cause an error here
    var listCalculated = visicomp.core.calculation.callRecalculateList(recalculateList,actionResponse);

    return listCalculated;
}


