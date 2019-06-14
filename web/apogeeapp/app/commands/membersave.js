/** This file contains some methods for creating commands to do updates for component members.
 * There are 
 */

apogeeapp.app.membersave = {};

/** This function create a command so set the given data on the given member. The optional command
 * label can be set for a custom undo command label. */
apogeeapp.app.membersave.createSaveDataCommand = function(member,data,optionalCommandLabel,optionalSetsWorkspaceDirty) {
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    
    var setDataActionData = apogeeapp.app.membersave.getSaveDataAction(workspace,memberFullName,data);
    var undoActionData = apogeeapp.app.membersave.getMemberStateUndoAction(member);
    var commandLabel = optionalCommandLabel ? optionalCommandLabel : "Set member data: " + memberFullName;
    
    return apogeeapp.app.membersave.createCommand(workspace,setDataActionData,undoActionData,commandLabel,optionalSetsWorkspaceDirty);
}

/** This function creates a compound set data command. The optional command label can be ser for a
 * custom unfo command label. */
apogeeapp.app.membersave.createCompoundSaveDataCommand = function(workspace,updateInfo,optionalCommandLabel,optionalSetsWorkspaceDirty) {
    
    //make the action list
    var actionList = [];
    var undoActionList = [];
    for(var i = 0; i < updateInfo.length; i++) {
        let updateEntry = updateInfo[i];
        let member = updateEntry[0];
        let data = updateEntry[1];

        let childActionData = apogeeapp.app.membersave.getSaveDataAction(workspace,member.getFullName(),data);
        let childUndoActionData = apogeeapp.app.membersave.getMemberStateUndoAction(member);

        actionList.push(childActionData);
        undoActionList.push(childUndoActionData);
    }
    
    var actionData = {};
    actionData.action = apogee.compoundaction.ACTION_NAME;
    actionData.actions = actionList;
    
    var undoActionData = {};
    undoActionData.action = apogee.compoundaction.ACTION_NAME;
    undoActionData.actions = undoActionList;

    var commandLabel = optionalCommandLabel ? optionalCommandLabel : "Coumpond set data action";
    
    return apogeeapp.app.membersave.createCommand(workspace,actionData,undoActionData,commandLabel,optionalSetsWorkspaceDirty);
}

/** This function creates a command for setting the code on the given member. Optionally a clear
 * code data value can be passed in, which will be used to set the data value if the function
 * body is empty. An optional command label can also be set for a custom undo command label.
 */
apogeeapp.app.membersave.createSetCodeCommand = function(member,argList,functionBody,supplementalCode,optionalClearCodeDataValue,optionalCommandLabel,optionalSetsWorkspaceDirty) {
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    
    var setCodeActionData = apogeeapp.app.membersave.getSetCodeAction(workspace,memberFullName,argList,functionBody,supplementalCode,optionalClearCodeDataValue);
    var undoActionData = apogeeapp.app.membersave.getMemberStateUndoAction(member);
    var commandLabel = optionalCommandLabel ? optionalCommandLabel : "Set member code: " + memberFullName;
    
    return apogeeapp.app.membersave.createCommand(workspace,setCodeActionData,undoActionData,commandLabel,optionalSetsWorkspaceDirty);
}

/** This function creates a command to set the description on the given member. An optional 
 * command label can be suppled. */
apogeeapp.app.membersave.createSaveDescriptionCommand = function(member,text,optionalCommandLabel,optionalSetsWorkspaceDirty) {
    var workspace = member.getWorkspace();
    var memberFullName = member.getFullName();
    var oldDescription = member.getDescription();
    
    var setDescriptionActionData = apogeeapp.app.membersave.getSaveDescriptionAction(workspace,memberFullName,text);
    var undoActionData = apogeeapp.app.membersave.getSaveDescriptionAction(workspace,memberFullName,oldDescription);
    var commandLabel = optionalCommandLabel ? optionalCommandLabel : "Set member description: " + memberFullName;
    
    return apogeeapp.app.membersave.createCommand(workspace,setDescriptionActionData,undoActionData,commandLabel,optionalSetsWorkspaceDirty);
}


/** This method can be called to create a undo function to return a member to the current state
 * following a code or data update. */
apogeeapp.app.membersave.getMemberStateUndoAction = function(member) {
    
    let workspace = member.getWorkspace();
    let memberFullName = member.getFullName();
    
    if((member.isCodeable)&&(member.hasCode())) {
        //check if the current state has code set - if so, set the code for the undo function
        let oldArgList = member.getArgList();
        let oldFunctionBody = member.getFunctionBody();
        let oldPrivateCode = member.getSupplementalCode();
        return apogeeapp.app.membersave.getSetCodeAction(workspace,memberFullName,oldArgList,oldFunctionBody,oldPrivateCode);
    }
    else {
        //here the object has data set. Check if an "alternate" data values was set - error, pending or invalid
        if(member.hasError()) {
            //member has an error
            let errors = member.getErrors();
            let errorMessage = apogee.ActionError.getListErrorMsg(errors);
            return apogeeapp.app.membersave.getSaveDataAction(workspace,memberFullName,new Error(errorMessage));
            
        }
        else if(member.getResultInvalid()) {
            //result is invalid - set value to invalid in undo
            return apogeeapp.app.membersave.getSaveDataAction(workspace,memberFullName,apogee.util.INVALID_VALUE);
        }
        else {
            //this is a standard data value or a promise
            //note if it is a promise and the promise has not yet resolved we will have mutliple then/catch functions
            //attached to it. That is OK, only one will succeed because for others the promise is no longer pending.
            let oldData = member.getData();
            return apogeeapp.app.membersave.getSaveDataAction(workspace,memberFullName,oldData);
        }
    }
}



//===============================
// Internal functions - these are not necessarily intended for public use.
//===============================

/** This is a convenience method for creating a command. 
 * @private */
apogeeapp.app.membersave.createCommand = function(workspace,cmdActionData,undoCmdActionData,commandLabel,optionalSetsWorkspaceDirty) {
    var command = {};
    command.cmd = () => apogeeapp.app.membersave.doCommandAction(workspace,cmdActionData);
    command.undoCmd = () => apogeeapp.app.membersave.doCommandAction(workspace,undoCmdActionData);
    command.desc = commandLabel;
    if(optionalSetsWorkspaceDirty) command.setsDirty = true;
    return command
}

/** This is a convenience method for exeduing a command. 
 * @private */
apogeeapp.app.membersave.doCommandAction = function(workspace,actionData) {
    var actionResult =  apogee.action.doAction(workspace,actionData);
    if(actionResult.alertMsg) apogeeapp.app.CommandManager.errorAlert(actionResult.alertMsg);
    return actionResult.actionDone;
}

/** @private */
apogeeapp.app.membersave.getSaveDataAction = function(workspace,memberFullName,data) {

    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
    actionData.memberName = memberFullName;
    actionData.data = data;
    if(data instanceof Promise) {
        //add a promise callback if this is a promise, to handle any alert
        actionData.promiseCallback = actionReslt => {
            if(actionResult.alertMsg) apogeeapp.app.CommandManager.errorAlert(actionResult.alertMsg); 
        }
    }
    
    return actionData;
}

/** @private */
apogeeapp.app.membersave.getSetCodeAction = function(workspace,memberFullName,argList,functionBody,supplementalCode,optionalClearCodeDataValue) {
     
    var actionData = {};

    if((optionalClearCodeDataValue != undefined)&&(functionBody == "")&&(supplementalCode == "")) {
        //special case - clear code
        actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME;
        actionData.memberName = memberFullName;
        actionData.data = optionalClearCodeDataValue;
    }
    else {
        //standard case - edit code
        actionData.action = apogee.updatemember.UPDATE_CODE_ACTION_NAME;
        actionData.memberName = memberFullName;
        actionData.argList = argList;
        actionData.functionBody = functionBody;
        actionData.supplementalCode = supplementalCode;  
    }

    return actionData;
}

/** @private */
apogeeapp.app.membersave.getSaveDescriptionAction = function(workspace,memberFullName,text) {

    if((text === null)||(text === undefined)) {
        text = "";
    }

    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_DESCRIPTION_ACTION_NAME;
    actionData.memberName = memberFullName;
    actionData.description = text;
    
    return actionData;
}





