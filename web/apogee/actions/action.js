import {addToRecalculateList,addDependsOnToRecalculateList,callRecalculateList} from "/apogee/lib/workspaceCalculation.js";

/**
 * Action Module
 * An action is an operation on the data model. The code in this module handles
 * the generic parts of the action process, and the action specific code is placed
 * elsewhere.
 * 
 * Generic Action:
 * - The action is represented by a data object "actionData". 
 * - The method doAction is called to exectue the action.
 * - Available actions are registered through the method addActionInfo.
 *   this allows the doAction method to dispatch the actionData to the proper
 *   action specific code.
 * - Included in doing that action is any updates to dependent tables and the 
 * firing of any events for the changes.
 *   
 * Registering a specific action:
 * To register a specific action, addActionInfo must be called with 
 * a actionInfo object. An action info object is of the following format.
 * actionInfo object: {
 *   "action": (string - this is the name of the action)
 *   "actionFunction": (funtion to exectue object - arguments = actionData,processedActions),
 *   "checkUpdateAll": (boolean - indicates if change in the underlying data model),
 *   "updateDependencies": [Indicates the changed object requires its dependecies be updated),
 *   "addToRecalc": (Indicates the changed object should be added to the recalc list, with its dependencies),
 *   "addDependenceiesToRecalc": (Indicates the changed object should have its dependencies be added to the recalc list, but not itself),
 *   "event": (The name of the event to fire for this object and action.)
 * }
 * 
 * Action Data Format:
 * The action data is used to pass data into the action specific code, and alse to 
 * pass data back from the action specific code. Format:
 * actionData format: {
 *   "action": (The name of the action to execute),
 *   "member": (The data object that is acted upon , if applicable),
 *   (other, multiple): (Specific data for the action),
 *   "onComplete": (OPTIONAL - If this is set it will be called after the action is completed.)
 *   "onAsynchComplete": (OPTIONAL - FOr an asynchronous update, this can be set. It will be
 *   called when the asynch action completes.)
 * }
 * 
 * ActionResult:
 * The return value of the doAction function is an ActionResult struct, with the following data: {
 *   "actionDone": (If this is returned true the action was done. This does not mean it was error free but
 *      it typically does mean the action can be reversed such as with an undo. An example of
 *      where there was an error is if the user is setting code that has a syntax error or that does 
 *      not properly (exectue.)
 *   "actionPending": This flag is returned if the action is a queued action and will be run after the
 *      current action completes.)
 *   "member":
 *   "actionInfo" - (This is the action info associated with the action, mainly used for bookeeping.)
 *   "alertMsg"" (This is a message that should be given to the user. It usually will be sent if there is an error
 *      where actionDone is false, though it may be set on actionDone = true too.)
 *   "isFatal": "If this value is set to true then the application is in an indeterminate state and the user
 *      should not continue."
 *   "childActionResults" - (This is a list of action results if there are additional child actions done with this
 *      action. Examples where this is used are on creating, moving or deleting a folder that has chilren.)
 * }
 * 
 * Action Function:
 * The action function executes the action specific code. It is passed the actionData object
 * and an array "processedActions.". The actions must add any executed actions to the action
 * list. This is done in the action function as opposed to outside because the action
 * function may exectue multiple actions, such as deleting multiple objects.
 * 
 * 
 */ 

/** This structure holds the processing information for all the actions. It is set by each action. 
 * @private */
let actionInfoMap = {
}

/** This method is used to execute an action for the data model. */
export function doAction(workspace,actionData) {
    
    var actionResult = {};
    
    //only allow one action at a time
    if(workspace.isActionInProgress()) {
        //this is a messenger action - we will save it and execute it after this computation cycle is complete
        workspace.saveMessengerAction(actionData);
        
        //mark command as pending
        actionResult.actionPending = true;
        return actionResult;
    }
    
    //flag action in progress
    workspace.setActionInProgress(true);
    
    try {   
        
        //do the action
        callActionFunction(workspace,actionData,actionResult); 
        
        //finish processing the action
        var recalculateList = [];
        
        var completedResults = [];
        addToCompletedResultList(completedResults,actionResult)
        
        //handle cases with a valid object 
        updateDependencies(workspace,completedResults,recalculateList);
        
        updateRecalculateList(completedResults,recalculateList);
        
        callRecalculateList(recalculateList);
    
        //fire events
        fireEvents(workspace,completedResults,recalculateList);
	}
	catch(error) {
        if(error.stack) console.error(error.stack);
        
        //unknown application error - this is fatal
        actionResult.actionDone = false;
        actionResult.isFatal = true
        actionResult.alertMsg = "Unknown error updating model: " + error.message;
        
        workspace.clearCommandQueue();
        workspace.setActionInProgress(false);
        return actionResult;
        
    }
    
    //flag action in progress
    workspace.setActionInProgress(false);
    actionResult.actionDone = true;
    
    //if the action has an onComplete callback, call it here.
    if(actionData.onComplete) {
        actionData.onComplete(actionResult);
    }
    
    //trigger any pending actions
    //these will be done asynchronously
    var savedMessengerAction = workspace.getSavedMessengerAction();
    if(savedMessengerAction) {
        var runQueuedAction = true;

        if(workspace.checkConsecutiveQueuedActionLimitExceeded()) {
            //ask user if about continueing
            var doContinue = confirm("The calculation is taking a long time. Continue?");
            if(!doContinue) {
                workspace.setCalculationCanceled();
                runQueuedAction = false;
            }
        }

        if(runQueuedAction) {
            //FOR NOW WE WILL RUN SYNCHRONOUSLY!!!
            doAction(workspace,savedMessengerAction);
        }
    }
    else {
        workspace.clearConsecutiveQueuedTracking();
    }
    
    //return actionResult
	return actionResult;
}

/** This function is used to register an action. */
export function addActionInfo(actionInfo) {
    if(!actionInfo.action) {
        //we hav to ignore this action
        alert("Action name missing from action info: " + JSON.stringify(actionInfo));
        return;
    }
    actionInfoMap[actionInfo.action] = actionInfo;
}

/** This function looks up the proper function for an action and executes it. */
function callActionFunction(workspace,actionData,actionResult) {

    //do the action
    var actionInfo = actionInfoMap[actionData.action];
    if(actionInfo) {
        actionResult.actionInfo = actionInfo;
        actionInfo.actionFunction(workspace,actionData,actionResult);
    }
    else {
        actionResult.actionDone = false;
        actionResult.alertMsg = "Unknown action: " + actionData.action;
    }  
}

//=======================================
// Internal Methods
//=======================================

/** This method makes sure the member dependencies in the workspace are properly updated. 
 * @private */
function updateDependencies(workspace,completedResults,recalculateList) {
    //check if we need to update the entire model
    var updateAllDep = checkUpdateAllDep(completedResults);
    if(updateAllDep) {
        //update entire model - see conditions bewlo
        workspace.updateDependeciesForModelChange(recalculateList);
    }
    else {
        //upate dependencies on table with updated code
        for(var i = 0; i < completedResults.length; i++) {
            var actionResult = completedResults[i];
            if((actionResult.actionDone)&&(actionResult.member)) {
                if(doInitializeDependencies(actionResult)) {
                    actionResult.member.initializeDependencies();
                }
            }
        }
    }
}
    
/** This function updates the recalculation list for the given processed actions. 
 * @private */
function updateRecalculateList(completedResults,recalculateList) {
    for(var i = 0; i < completedResults.length; i++) {
        var actionResult = completedResults[i];
        if((actionResult.actionDone)&&(actionResult.member)) {
            if(doAddToRecalc(actionResult)) {
                addToRecalculateList(recalculateList,actionResult.member);            
            }
            else if((doAddDependOnToRecalc(actionResult))) {
                addDependsOnToRecalculateList(recalculateList,actionResult.member);                         
            }
        }
    }
}
    
/** This function fires the proper events for the  It combines events to 
 * fire a single event for each member.
 * @private */
function fireEvents(workspace,completedResults,recalculateList) {

    var eventMap = {};
    var member;
    
    //go through explicitly called events from results
    for(var i = 0; i < completedResults.length; i++) {
        var actionResult = completedResults[i];
        var actionInfo = actionResult.actionInfo;
        
        if(actionInfo) {
            
            let eventName = actionInfo.event;
            if(!eventName) continue;
            
            let member = actionResult.member;
            
            mergeEventIntoEventMap(eventMap,member,eventName);
        }
    }
    
    //add an update event for any object not accounted from
    for(i = 0; i < recalculateList.length; i++) {
        var member = recalculateList[i];
        mergeEventIntoEventMap(eventMap,member,"memberUpdated");
    } 
    
    //fire events from the event map
    for(var idString in eventMap) {
        let eventInfo = eventMap[idString];
        workspace.dispatchEvent(eventInfo.event,eventInfo);
        //clear the update map for this member (the member should be set
        if(eventInfo.member) {
            eventInfo.member.clearUpdated();
        }
        else {
            console.log("Error: Member not set for event: " + eventInfo.event);
        }
    }
}

/** This is a helper function to dispatch an event. */
function mergeEventIntoEventMap(eventMap,member,eventName) {
    
    //############################################
    //OOPS - my current logic does nto allow for non-member events. 
    //for now I will dump them. i need to add them back.
    if(!member) return;
    //############################################
    
    var memberId = member.getId();
     
    var existingInfo = eventMap[memberId];
    var newInfo;
     
    if(existingInfo) {
        if((existingInfo.event == eventName)) {
            //repeat event - including case of both being "memberUpdated"
            newInfo = existingInfo;
        }
        else if((existingInfo.event == "memberDeleted")||(eventName == "memberDeleted")) {
            newInfo =  { member: member, event: "memberDeleted" };
        }
        else if((existingInfo.event == "memberCreated")||(eventName == "memberCreated")) {
            newInfo =  { member: member, updated: member.getUpdated(), event: "memberCreated" };
        }
        else {
            //we this shouldn't happen - it means we hace an unknown event type
            throw new Error("Unknown event type: " + existingInfo.event + ", " + eventName);
        }
    }
    else {
        //create event object - note we don't need the "updated" field on a delete event, but that is ok
        newInfo =  { member: member, updated: member.getUpdated(), event: eventName };
    }
     
    eventMap[memberId] = newInfo; 
}

/** This method determines if updating all dependencies is necessary. Our dependency 
 * tracking may be in error if a new member is created, a member is deleted or
 * a member is moved. In these actions we flag that the entire model should be
 * updated.*/
function checkUpdateAllDep(completedResults) {
    for(var i = 0; i < completedResults.length; i++) {
        var actionResult = completedResults[i];
        
        //we need to update the entire model if any actino is flagged as such
        if(actionResult.member) {
            var actionInfo = actionResult.actionInfo;
            if((actionInfo)&&(actionInfo.checkUpdateAll)){
                return true;
            }
        }
    }
    return false;
}

/** This method if a single action entry requires updating dependencies for the associated member. */
function doInitializeDependencies(actionResult) {
    if(!actionResult.member) return false;
    
    //only applicable to codeables
    if((actionResult.actionInfo)&&(actionResult.member.isCodeable)) {
        return actionResult.actionInfo.updateDependencies;
    }
    else {
        return false;
    }
}

/** This method checks if the associated member and its dependencies need to be added to the recalc list. */
function doAddToRecalc(actionResult) {
    if(!actionResult.member) return false;
    if(!actionResult.member.isDependent) return false;
    
    if(actionResult.actionInfo) {
        return actionResult.actionInfo.addToRecalc;
    }
    else {
        return false;
    }
}

/** This method checks if the dependencies of the associated needs to be added to the recalc list, but not the member itself. */
function doAddDependOnToRecalc(actionResult) {
    if(actionResult.actionInfo) {
        return actionResult.actionInfo.addDependenceiesToRecalc;
    }
    else {
        return false;
    }
}

/** This method unpacks the actionResult and its child reponse into an array of actionResult. */
function addToCompletedResultList(completedResults,actionResult) {
    completedResults.push(actionResult);
    if(actionResult.childActionResults) {
        for(var key in actionResult.childActionResults) {
            addToCompletedResultList(completedResults,actionResult.childActionResults[key]);
        }      
    }
}

//============================================
// Compound Action
//============================================

/** The compound action is automatically imported when the action module is imported.
 *
 * Action Data format:
 * {
 *  "action": "compoundAction",
 *  "actions": (list of actions in this compound action),
 * }
 */


/** This method is the action function for a compound action. */
function compoundActionFunction(workspace,actionData,actionResult) {

    var actionList = actionData.actions;
    actionResult.childActionResults = [];
    for(var i = 0; i < actionList.length; i++) {
        let childActionData = actionList[i];
        let childActionResult = {};
        action.callActionFunction(workspace,childActionData,childActionResult);
        actionResult.childActionResults.push(childActionResult);   
    }
    actionResult.actionDone = true;
}

/** Action info */
let COMPOUND_ACTION_INFO = {
    "action": "compoundAction",
    "actionFunction": compoundActionFunction,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": false,
    "event": null
}


//This line of code registers the action 
addActionInfo(COMPOUND_ACTION_INFO);


