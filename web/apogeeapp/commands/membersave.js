import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/** This file contains some methods for creating commands to do updates for component members.
 * There are 
 */



/** This method can be called to create a undo function to return a member to the current state
 * following a code or data update. */
export function getMemberStateUndoCommand(model, memberId) {
    
    var member = model.lookupMemberById(memberId);
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
            //save a sngle error
            command.data = [member.getErrorMsg()];
            
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

    command.memberId = memberId;
    
    return command;
}




/** @private */
export function getSaveDataAction(model,memberId,data) {

    var actionData = {};
    actionData.action = "updateData";
    actionData.memberId = memberId;
    actionData.data = data;
    return actionData;
}

export function getSetCodeAction(model,memberId,argList,functionBody,supplementalCode,optionalClearCodeDataValue) {
     
    var actionData = {};

    if((optionalClearCodeDataValue != undefined)&&(functionBody == "")&&(supplementalCode == "")) {
        //special case - clear code
        actionData.action = "updateData";
        actionData.memberId = memberId;
        actionData.data = optionalClearCodeDataValue;
    }
    else {
        //standard case - edit code
        actionData.action = "updateCode";
        actionData.memberId = memberId;
        actionData.argList = argList;
        actionData.functionBody = functionBody;
        actionData.supplementalCode = supplementalCode;  
    }

    return actionData;
}


