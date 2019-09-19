import util from "/apogeeutil/util.js";

/** This file contains some methods for creating commands to do updates for component members.
 * There are 
 */



/** This method can be called to create a undo function to return a member to the current state
 * following a code or data update. */
export function getMemberStateUndoCommand(workspace, memberFullName) {
    
    var member = workspace.getMemberByFullName(memberFullName);
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
        if(member.hasError()) {
            //member has an error
            let errors = member.getErrors();
            //Fix this to save all the 
            command.data = errors[0];
            
        }
        else if(member.getResultInvalid()) {
            //result is invalid - set value to invalid in undo
            command.data = util.INVALID_VALUE
        }
        else {
            //this is a standard data value or a promise
            //note if it is a promise and the promise has not yet resolved we will have mutliple then/catch functions
            //attached to it. That is OK, only one will succeed because for others the promise is no longer pending.
            command.data = member.getData();
        }
    }

    command.memberFullName = memberFullName;
    
    return command;
}




/** @private */
export function getSaveDataAction(workspace,memberFullName,data,asynchOnComplete) {

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
            if(asynchActionResult.alertMsg) asynchCommandResult.alertMsg = asynchActionResult.alertMsg;

            asynchOnComplete(asynchCommandResult);
        }
    }
    
    return actionData;
}

export function getSetCodeAction(workspace,memberFullName,argList,functionBody,supplementalCode,optionalClearCodeDataValue) {
     
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


