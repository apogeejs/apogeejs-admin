import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/** This file contains some methods for creating commands to do updates for component members.
 * There are 
 */



/** This method can be called to create a undo function to return a member to the current state
 * following a code or data update. */
export function getMemberStateUndoCommand(model, memberFullName) {
    
    var member = model.getMemberByFullName(memberFullName);
    var command = {};
    
    if((member.isCodeable)&&(member.hasCode())) {
        //check if the current state has code set - if so, set the code for the undo function
        command.type = "saveMemberCode";
        command.argList = member.getArgList();
        command.functionBody = member.getFunctionBody();
        command.supplemental = member.getSupplementalCode();      
    }
    else {
        command.type = "saveMemberData";
        
        //here the object has data set. Check if an "alternate" data values was set - error, pending or invalid
        let state = member.getState();
        if(state == apogeeutil.STATE_ERROR) {
            //member has an error
            let errors = member.getErrors();
            //Fix this to save all the 
            command.data = errors[0];
            
        }
        else if(state == apogeeutil.STATE_INVALID) {
            //result is invalid - set value to invalid in undo
            command.data = apogeeutil.INVALID_VALUE
        }
        else if(state == apogeeutil.STATE_PENDING) {
            //we have a pending promise. use it for the command
            commandData = member.getPendingPromise();
        }
        else {
            //normal data case
            command.data = member.getData();
        }
    }

    command.memberFullName = memberFullName;
    
    return command;
}




/** @private */
export function getSaveDataAction(model,memberFullName,data,asynchOnComplete) {

    var actionData = {};
    actionData.action = "updateData";
    actionData.memberName = memberFullName;
    actionData.data = data;
        
    //handle the asynch case
    if((data instanceof Promise)&&(asynchOnComplete)) {
        //add a promise callback if this is a promise, to handle any alert
        actionData.promiseCallback = asynchActionResult => {
            var asynchCommandResult = {};
            asynchCommandResult.cmdDone = asynchActionResult.actionDone;
            asynchCommandResult.actionResult = asynchActionResult;

            asynchOnComplete(asynchCommandResult);
        }
    }
    
    return actionData;
}

export function getSetCodeAction(model,memberFullName,argList,functionBody,supplementalCode,optionalClearCodeDataValue) {
     
    var actionData = {};

    if((optionalClearCodeDataValue != undefined)&&(functionBody == "")&&(supplementalCode == "")) {
        //special case - clear code
        actionData.action = "updateData";
        actionData.memberName = memberFullName;
        actionData.data = optionalClearCodeDataValue;
    }
    else {
        //standard case - edit code
        actionData.action = "updateCode";
        actionData.memberName = memberFullName;
        actionData.argList = argList;
        actionData.functionBody = functionBody;
        actionData.supplementalCode = supplementalCode;  
    }

    return actionData;
}


