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
visicomp.core.updatemember.OBJECT_UPDATED_EVENT = "memberUpdated";

visicomp.core.updatemember.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(visicomp.core.updatemember.MEMBER_UPDATED_EVENT,member);
}

visicomp.core.updatemember.fireUpdatedEventList = function(memberList) {
    for(var i = 0; i < memberList.length; i++) {
        visicomp.core.updatemember.fireUpdatedEvent(memberList[i]);
    }
}

/** This method updates the object function for a given member. The return value
 * is an Action Response object.*/
visicomp.core.updatemember.updateCode = function(member,argList,functionBody,supplementalCode) {
    var actionResponse = visicomp.core.util.createActionResponse();
    var actionErrorList = actionResponse.errorList;
    var recalculateList = [];
    
    var dataSet = visicomp.core.updatemember.updateObjectFunction(member,
        argList,
        functionBody,
        supplementalCode,
        recalculateList,
        actionErrorList);
        
    if(!dataSet) {
        //table not updated
        actionResponse.success = false;
        actionResponse.actionDone = dataSet;
        return actionResponse;
    }
    
    var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionErrorList);
    actionResponse.success = calcSuccess;
    actionResponse.actionDone = true;
    
    //fire updated events
    visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    
    return actionResponse;
}

/** This method updates the data for a given member. The return value
 * is an Action Response object.*/
visicomp.core.updatemember.updateData = function(member,data) {
    var actionResponse = visicomp.core.util.createActionResponse();
    var actionErrorList = actionResponse.errorList;
    var recalculateList = [];

    var dataSet = visicomp.core.updatemember.updateObjectData(member,
        data,
        recalculateList,
        actionErrorList);
    
    if(!dataSet) {
        actionResponse.success = false;
        actionResponse.actionDone = false;
        return actionResponse;
    }
    
    var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionErrorList);
    actionResponse.success = calcSuccess;
    actionResponse.actionDone = true;
    
    //fire updated events
    visicomp.core.updatemember.fireUpdatedEvent(member);
    visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    
    return actionResponse;
}

/** This method updates the object function or the data for a list of members. The return value
 * is an Action Response object. This method does not keep track of the action response value
 * actionDone, since there are multiple object acted upon. */
visicomp.core.updatemember.updateObjects = function(updateDataList) {
    var actionResponse = visicomp.core.util.createActionResponse();
    var actionErrorList = actionResponse.errorList;
    var recalculateList = [];
    var setDataList = [];

    //update members and add to recalculate list
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
                recalculateList,
                actionErrorList);
        }
        else if(data) {
            var uodDataSet = visicomp.core.updatemember.updateObjectData(member,
                data,
                recalculateList,
                actionErrorList);
            
            setDataList.push(member);
        }
    }

    var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionErrorList);
    actionResponse.success = calcSuccess;
    actionResponse.actionDone = true;
    
    //fire updated events
    visicomp.core.updatemember.fireUpdatedEventList(setDataList);
    visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    
    return actionResponse;
}

//=====================================
// Private Functions
//=====================================

/** This method updates the code and object function in a member based on the
 * passed code. It returns true if the data was set and false if there was an
 * error before the data was set. */
visicomp.core.updatemember.updateObjectFunction = function(member,
        argList,
        functionBody,
        supplementalCode,
        recalculateList,
        actionErrorList) {
    
    //process the code
    var codeInfo;
	var codeInfoValid = false;
    var actionError;
    var errorMsg;
   
    try {
        codeInfo = visicomp.core.updatemember.processCode(member,argList,functionBody,supplementalCode);
		codeInfoValid = true;
    }
    catch(error) {
		//this is an error in the code
        if(error.stack) {
			console.error(error.stack);
		}
        var errorMsg = error.message ? error.message : "An unknown error ocurred";
        member.setCodeError(errorMsg);
        actionError = visicomp.core.util.createActionError(errorMsg,visicomp.core.util.ACTION_ERROR_MODEL);
        actionErrorList.push(actionError);
    }
         
    //save the code
    if(codeInfoValid) {
		try {
			member.setCodeInfo(codeInfo);
		}
		catch(error) {
			//this is an error in the code
			if(error.stack) {
				console.error(error.stack);
			}
            errorMsg = error.message ? error.message : "An unknown error ocurred";
            member.setCodeError(errorMsg);
            actionError = visicomp.core.util.createActionError(errorMsg,visicomp.core.util.ACTION_ERROR_MODEL);
            actionErrorList.push(actionError);
		}
	}
    
	//update recalculate list
    try {
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
    }
    catch(error) {
		//this is an unknown program error
        if(error.stack) {
            console.error(error.stack);
        }
        errorMsg = error.message ? error.message : "An unknown error ocurred";
        member.setCodeError(errorMsg);
        actionError = visicomp.core.util.createActionError(errorMsg,visicomp.core.util.ACTION_ERROR_APP);
        actionErrorList.push(actionError);
    }
    
    return codeInfoValid;
}


/** This method sets the data for a member. The return value indicates if the
 * save was done (or at least attempted). */
visicomp.core.updatemember.updateObjectData = function(member,
        data,
        recalculateList,
        actionErrorList) {
            
    var actionError;
    var errorMsg;

    //set data
    try {
        member.setData(data);
        member.clearCode();
    }
    catch(error) {
		//this is a data error
		if(error.stack) {
			console.error(error.stack);
		}
        errorMsg = error.message ? error.message : "An unknown error ocurred";
        member.setDataError(errorMsg);
        actionError = visicomp.core.util.createActionError(errorMsg,visicomp.core.util.ACTION_ERROR_MODEL);
        actionErrorList.push(actionError);
    }
    
    try {
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
    }
    catch(error) {
        //this is an unknown program error
        if(error.stack) {
            console.error(error.stack);
        }
        errorMsg = error.message ? error.message : "An unknown error ocurred";
        actionError = visicomp.core.util.createActionError(errorMsg,visicomp.core.util.ACTION_ERROR_APP);
        actionErrorList.push(actionError);
        
    }

    //in this method data set is always attempted
    return true;
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.doRecalculate = function(recalculateList,actionErrorList) {
     
    try {
        //sort list
        var listSorted = visicomp.core.calculation.sortRecalculateList(recalculateList,actionErrorList);
    
        //recalculate list
        //if there is a sort error (ciruclar reference) this will also cause an error here
        var listCalculated = visicomp.core.calculation.callRecalculateList(recalculateList,actionErrorList);

        return listCalculated;
    }
    catch(error) {
		//this is an unknown program error
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = error.message ? error.message : "An unknown error ocurred";
        actionError = visicomp.core.util.createActionError(errorMsg,visicomp.core.util.ACTION_ERROR_APP);
        actionErrorList.push(actionError);
        
        return false;
    }
}

visicomp.core.updatemember.processCode = function(member,argList,functionBody,supplementalCode) {
    
    //load some needed variables
    var localFolder = member.getParent();
    var rootFolder = member.getRootFolder();
    var codeLabel = member.getFullName();
    
    var codeInfo = visicomp.core.codeCompiler.processCode(argList,
        functionBody,
        supplementalCode,
        localFolder,
        rootFolder,
        codeLabel);
        
    return codeInfo;
}


