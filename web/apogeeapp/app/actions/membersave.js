

apogeeapp.app.membersave = {};


//=============================
// Shared methods
//=============================

/** @private */
apogeeapp.app.membersave.createSaveDataCommand = function(member,data) {
    
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    
    var command = {};
    command.cmd = () => apogeeapp.app.membersave.doSaveData(workspace,memberFullName,data);
    command.undoCmd = apogeeapp.app.membersave.getMemberStateUndoCommand(member);
    
    command.desc = "Set data value: " + member.getFullName();
    
    return command
}

/** This method is a common method to set the code and supplemental code. It also
 * will clear the code if both code fields are empty and a defined optionalClearCodeDataValue is set. 
 * @private */
apogeeapp.app.membersave.createSetCodeCommand = function(member,argList,functionBody,supplementalCode,optionalClearCodeDataValue) {
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    
    var command = {};
    command.cmd = () => apogeeapp.app.membersave.doSetCode(workspace,memberFullName,argList,functionBody,supplementalCode,optionalClearCodeDataValue);
    command.undoCmd = apogeeapp.app.membersave.getMemberStateUndoCommand(member);
    
    command.desc = "Set code: " + member.getFullName();

    return command;
}

apogeeapp.app.membersave.createSaveDescriptionCommand = function(member,text) {
    
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    var oldDescription = member.getDescription();
    
    var command = {};
    command.cmd = () => apogeeapp.app.membersave.doSaveDescription(workspace,memberFullName,text);
    command.undoCmd = () => apogeeapp.app.membersave.doSaveDescription(workspace,memberFullName,oldDescription);
    command.desc = "Set Description: " + memberFullName;
    
    return command;
}

//===============================
// Command functions
//===============================


/** @private */
apogeeapp.app.membersave.doSaveData = function(workspace,memberFullName,data) {
    
    var member  = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        throw new Error("Error calling save - member not fond: " + memberFullName);
    }
    
    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
    actionData.member = member;
    actionData.data = data;
    var actionResponse =  apogee.action.doAction(actionData,true);

    return actionResponse;    
}

/** @private */
apogeeapp.app.membersave.doSetCode = function(workspace,memberFullName,argList,functionBody,supplementalCode,optionalClearCodeDataValue) {
     
    var member  = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        throw new Error("Error calling save - member not fond: " + memberFullName);
    }
     
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
apogeeapp.app.membersave.doSaveDescription = function(workspace,memberFullName,text) {

    var member = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        throw new Error("Error calling save - member not fond: " + memberFullName);
    }
    
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

/** @private */
apogeeapp.app.membersave.doErrorUpdate = function(workspace,memberFullName,errorMessage) {
    return apogeeapp.app.membersave.doSaveData(workspace,memberFullName,new Error(errorMessage));
}

/** This method resets the pending state for a member. It does not reissue the pending promise, that should al 
 * @private */
apogeeapp.app.membersave.doResetPendingState = function(workspace,memberFullName,pendingPromise) {
    
    var member  = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        throw new Error("Error calling save - member not fond: " + memberFullName);
    }
    
    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
    actionData.member = member;
    actionData.data = pendingPromise;
    actionData.promiseRefresh = true;
    var actionResponse =  apogee.action.doAction(actionData,true);

    return actionResponse;  
}


/** This method can be called to create a undo function to return a member to the current state
 * following a code or data update. */
apogeeapp.app.membersave.getMemberStateUndoCommand = function(member) {
    
    let undoCommand;
    
    let workspace = member.getWorkspace();
    let memberFullName = member.getFullName();
    
    if((member.isCodeable)&&(member.hasCode())) {
        //check if the current state has code set - if so, set the code for the undo function
        let oldArgList = member.getArgList();
        let oldFunctionBody = member.getFunctionBody();
        let oldPrivateCode = member.getSupplementalCode();
        undoCommand = () => apogeeapp.app.membersave.doSetCode(workspace,memberFullName,oldArgList,oldFunctionBody,oldPrivateCode);
    }
    else {
        //here the object has data set. Check if an "alternate" data values was set - error, pending or invalid
        if(member.hasError()) {
            //member has an error
            let errors = member.getErrors();
            let errorMessage = apogee.ActionResponse.getListErrorMsg(errors);
            undoCommand = () => apogeeapp.app.membersave.doErrorUpdate(workspace,memberFullName,errorMessage);
            
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
                    return apogeeapp.app.membersave.doSaveData(workspace,memberFullName,promiseValue);
                }
                else if(promiseFailed) {
                    //if the promise is failed the undo should be a error message
                    return apogeeapp.app.membersave.doErrorUpdate(workspace,memberFullName,promiseErrorMessage);
                }
                else {
                    //if the promise is not resolved or failed, we can just reset the member to pending with this promise
                    return apogeeapp.app.membersave.doResetPendingState(workspace,memberFullName,pendingPromise);
                }  
            }
        }
        else if(member.getResultInvalid()) {
            //result is invalid - set value to invalid in undo
            undoCommand = () => apogeeapp.app.membersave.doSaveData(workspace,memberFullName,apogee.util.INVALID_VALUE);
        }
        else {
            //this is a standard data value
            let oldData = member.getData();
            undoCommand = () => apogeeapp.app.membersave.doSaveData(workspace,memberFullName,oldData);
        }
    }
    
    return undoCommand;
    
}






