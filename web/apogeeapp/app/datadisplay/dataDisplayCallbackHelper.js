
apogeeapp.app.dataDisplayCallbackHelper = {};

apogeeapp.app.dataDisplayCallbackHelper.formatString = "\t";

/** This function creates editor callbacks or member data where the editor takes JSON format. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks = function(member) {
    return {
        getData: () => member.getData(),
        getEditOk: () => (!member.hasCode()),
        saveData: (data) => apogeeapp.app.dataDisplayCallbackHelper.saveData(member,data)
    }
}

/** This function creates editor callbacks or member data where the editor takes text format. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks = function(member) {
    return {
        getData: () => {
            var json = member.getData();	

            var textData;
            if(json === null) {
                textData = "null";
            }
            else if(json === undefined) {
                textData = "undefined";
            }
            else {
                textData = JSON.stringify(json,null,apogeeapp.app.dataDisplayCallbackHelper.formatString);
            }

            return textData;
        },
        getEditOk: () => (!member.hasCode()),
        saveData: (text) => {
            var data;
            if(text.length > 0) {
                try {
                    data = JSON.parse(text);
                }
                catch(error) {
                    //parsing error
                    alert("There was an error parsing the JSON input: " +  error.message);
                    return false;
                }
            }
            else {
                data = "";
            }

            return apogeeapp.app.dataDisplayCallbackHelper.saveData(member,data);
        }
    }
}

/** This function creates editor callbacks or the member function body. 
 * The argument optionalClearCodeValue can optionally be set. If so, the member data will be 
 * set with this value if the function body and supplemental code are empty. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks = function(member,optionalClearCodeDataValue) {
    return {
        getData: () => member.getFunctionBody(),
        getEditOk: () => true,
        saveData: (text) => {
            var argList = member.getArgList();
            var functionBody = text;
            var supplementalCode = member.getSupplementalCode();
            return apogeeapp.app.dataDisplayCallbackHelper.setCode(member,argList,functionBody,supplementalCode,optionalClearCodeDataValue);
        }
    }
}

/** This function creates editor callbacks or the member supplemental code. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks = function(member,optionalClearCodeDataValue) {
    return {
        getData: () => member.getSupplementalCode(),
        getEditOk: () => true,
        saveData: (text) => {
            var argList = member.getArgList();
            var functionBody = member.getFunctionBody();
            var supplementalCode = text;
            return apogeeapp.app.dataDisplayCallbackHelper.setCode(member,argList,functionBody,supplementalCode,optionalClearCodeDataValue);
        }
    }
}

/** This function creates editor callbacks or the member description. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks = function(member) {
    return {
        getData: () => member.getDescription(),
        getEditOk: () => true,
        saveData: (text) => apogeeapp.app.dataDisplayCallbackHelper.saveDescription(member,text)
    }
}

//=============================
// Shared methods
//=============================

/** @private */
apogeeapp.app.dataDisplayCallbackHelper.saveData = function(member,data) {
    
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    
    var command = {};
    command.cmd = () => apogeeapp.app.dataDisplayCallbackHelper.doSaveData(workspace,memberFullName,data);
    command.undoCmd = apogeeapp.app.dataDisplayCallbackHelper.getMemberStateUndoCommand(member);
    
    command.desc = "Set data value: " + member.getFullName();
    
    apogeeapp.app.Apogee.getInstance().executeCommand(command);
    
    return true;
}

/** This method is a common method to set the code and supplemental code. It also
 * will clear the code if both code fields are empty and a defined optionalClearCodeDataValue is set. 
 * @private */
apogeeapp.app.dataDisplayCallbackHelper.setCode = function(member,argList,functionBody,supplementalCode,optionalClearCodeDataValue) {
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    
    var command = {};
    command.cmd = () => apogeeapp.app.dataDisplayCallbackHelper.doSetCode(workspace,memberFullName,argList,functionBody,supplementalCode,optionalClearCodeDataValue);
    command.undoCmd = apogeeapp.app.dataDisplayCallbackHelper.getMemberStateUndoCommand(member);
    
    command.desc = "Set code: " + member.getFullName();
    
    apogeeapp.app.Apogee.getInstance().executeCommand(command);
    
    return true;
}

apogeeapp.app.dataDisplayCallbackHelper.saveDescription = function(member,text) {
    
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    var oldDescription = member.getDescription();
    
    var command = {};
    command.cmd = () => apogeeapp.app.dataDisplayCallbackHelper.doSaveDescription(workspace,memberFullName,text);
    command.undoCmd = () => apogeeapp.app.dataDisplayCallbackHelper.doSaveDescription(workspace,memberFullName,oldDescription);
    command.desc = "Set Description: " + memberFullName;
    
    apogeeapp.app.Apogee.getInstance().executeCommand(command);
    
    return true;
}

/** This method can be called to create a undo function to return a member to the current state
 * following a code or data update. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberStateUndoCommand = function(member) {
    
    let undoCommand;
    
    let workspace = member.getWorkspace();
    let memberFullName = member.getFullName();
    
    if((member.isCodeable)&&(member.hasCode())) {
        //check if the current state has code set - if so, set the code for the undo function
        let oldArgList = member.getArgList();
        let oldFunctionBody = member.getFunctionBody();
        let oldPrivateCode = member.getSupplementalCode();
        undoCommand = () => apogeeapp.app.dataDisplayCallbackHelper.doSetCode(workspace,memberFullName,oldArgList,oldFunctionBody,oldPrivateCode);
    }
    else {
        //here the object has data set. Check if an "alternate" data values was set - error, pending or invalid
        if(member.hasError()) {
            //member has an error
            let errors = member.getErrors();
            let errorMessage = apogee.ActionResponse.getListErrorMsg(errors);
            undoCommand = () => apogeeapp.app.dataDisplayCallbackHelper.doErrorUpdate(workspace,memberFullName,errorMessage);
            
        }
        else if(member.getResultPending()) {
            //the result is pending
            //our undo will have to either reinstate this promse, if it is not yet resolved,
            //or if it is resolved, set the data to the resolved value or set the error message.
            let pendingPromise = member.getPendingPromise();
            
            let promiseResolved = false;
            let promiseFailed = false;
            let promiseValue;
            let promiseErrorMessage;
            
            let storePromiseResolution = resultValue => {
                promiseResolved = true;
                promiseValue = resultValue;
            }
            
            let storePromiseErrorMessage = errorMsg => {
                promiseFailed = true;
                promiseErrorMessage = errorMsg;
            }
            
            //add another then/catch to the promise
            pendingPromise.then(storePromiseResolution).catch(storePromiseErrorMessage);
            
            //the undo command reinstates the pending state or it sets the appropriate value/error
            undoCommand = () => {
                
                if(promiseResolved) {
                    //if the promise if resolved, the undo should be a data update
                    return apogeeapp.app.dataDisplayCallbackHelper.doSaveData(workspace,memberFullName,promiseValue);
                }
                else if(promiseFailed) {
                    //if the promise is failed the undo should be a error message
                    return apogeeapp.app.dataDisplayCallbackHelper.doErrorUpdate(workspace,memberFullName,promiseErrorMessage);
                }
                else {
                    //if the promise is not resolved or failed, we can just reset the member to pending with this promise
                    return apogeeapp.app.dataDisplayCallbackHelper.doResetPendingState(workspace,memberFullName,pendingPromise);
                }  
            }
        }
        else if(member.getResultInvalid()) {
            //result is invalid - set value to invalid in undo
            undoCommand = () => apogeeapp.app.dataDisplayCallbackHelper.doSaveData(workspace,memberFullName,apogee.util.INVALID_VALUE);
        }
        else {
            //this is a standard data value
            let oldData = member.getData();
            undoCommand = () => apogeeapp.app.dataDisplayCallbackHelper.doSaveData(workspace,memberFullName,oldData);
        }
    }
    
    return undoCommand;
    
}

//===============================
// Command functions
//===============================


/** @private */
apogeeapp.app.dataDisplayCallbackHelper.doSaveData = function(workspace,memberFullName,data) {
    
    var member  = workspace.getMemberByFullName(memberFullName);
    
    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
    actionData.member = member;
    actionData.data = data;
    var actionResponse =  apogee.action.doAction(actionData,true);

    return actionResponse;    
}

/** @private */
apogeeapp.app.dataDisplayCallbackHelper.doSetCode = function(workspace,memberFullName,argList,functionBody,supplementalCode,optionalClearCodeDataValue) {
     
    var member  = workspace.getMemberByFullName(memberFullName);
     
    var actionData = {};

    if((optionalClearCodeDataValue != undefined)&&(functionBody == "")&&(supplementalCode == "")) {
        //special case - clear code
        actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
        actionData.member = member;
        actionData.data = optionalClearCodeDataValue;
    }
    else {
        //standard case - edit code
        actionData.action = apogee.updatemember.UPDATE_CODE_ACTION_NAME;
        actionData.member = member;
        actionData.argList = argList;
        actionData.functionBody = functionBody;
        actionData.supplementalCode = supplementalCode;  
    }

    var actionResponse =  apogee.action.doAction(actionData,true);

    return actionResponse;  
}

/** @private */
apogeeapp.app.dataDisplayCallbackHelper.doSaveDescription = function(workspace,memberFullName,text) {

    var member = workspace.getMemberByFullName(memberFullName);
    
    if((text === null)||(text === undefined)) {
        text = "";
    }

    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_DESCRIPTION_ACTION_NAME;
    actionData.member = member;
    actionData.description = text;
    var actionResponse =  apogee.action.doAction(actionData,true);

    return actionResponse;
}

//THESE ARE EXTERNALLY CALLED


/** @private */
apogeeapp.app.dataDisplayCallbackHelper.doErrorUpdate = function(workspace,memberFullName,errorMessage) {
    var member = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        throw new Error("Error calling messenger - member not fond: " + memberFullName);
    }

    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_ASYNCH_ERROR_ACTION_NAME;
    actionData.member = member;
    actionData.errorMsg = errorMessage;

    var actionResponse = apogee.action.doAction(actionData,true);
    
    return actionResponse;
}

/** This method resets the pending state for a member. It does not reissue the pending promise, that should al 
 * @private */
apogeeapp.app.dataDisplayCallbackHelper.doResetPendingState = function(workspace,memberFullName,pendingPromise) {
    var member = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        throw new Error("Error calling messenger - member not fond: " + memberFullName);
    }

    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_DATA_PENDING_ACTION_NAME;
    actionData.member = member;
    actionData.promise = pendingPromise;
    
    var actionResponse =  apogee.action.doAction(actionData,true);
    
    return actionResponse;
}


