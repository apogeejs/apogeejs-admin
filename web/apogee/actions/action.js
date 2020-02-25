import {addToRecalculateList,addDependsOnToRecalculateList,callRecalculateList} from "/apogee/lib/modelCalculation.js";

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
 *   "actionFunction": (funtion to exectue object - arguments = modeo,actionData,actionResult),
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
 *   (other, multiple): (Specific data for the action)
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
 *   "member": The object modified in the action (if it is a member. Model update will not have this)
 *   "actionInfo": (This is the action info associated with the action, mainly used for bookeeping.)
 *   "alertMsg": (This is a message that should be given to the user. It usually will be sent if there is an error
 *      where actionDone is false, though it may be set on actionDone = true too.)
 *   "childActionResults" - (This is a list of action results if there are additional child actions done with this
 *      action. Examples where this is used are on creating, moving or deleting a folder that has chilren.)
 * }
 * 
 * Action Function:
 * The action function executes the action specific code. It is passed the actionData object
 * along with the model. The actions must add any executed actions to the action
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
export function doAction(model,actionData) {
    
    let changeMap;
    
    //only allow one action at a time
    if(model.isActionInProgress()) {
        //this is a messenger action - we will save it and execute it after this computation cycle is complete
        model.saveMessengerAction(actionData);
        
        //mark command as pending
        let returnValue = {};
        returnValue.actionPending = true;
        return returnValue;
    }
    
    //flag action in progress
    model.setActionInProgress(true);

//##########################################
//FIRE ACTION START EVENT HERE
//##########################################    

    try {   
        
        //do the action
        let actionResult = callActionFunction(model,actionData); 

        if(!actionResult.actionDone) {
            let returnValue = {};
            returnValue.actionDone = false;
            returnValue.alertMsg = actionResult.alertMsg;
            return returnValue;
        }
        
        //flatten action result tree into a list of objects modified in the action
        var actionModifiedMembers = flattenActionResult(actionResult);

        //this list will be additional modified members - from dependency changes
        //due to adding and deleting members (This happens when a new remote member is referenced
        //a member formula because of creating or deleting. This is not a common event, but it does happen)
        var additionalUpdatedMembers = [];
        
        //figure out other objects that need to be updated
        //also update dependencies (and the inverse - impacts)
        var updateAllDep = checkUpdateAllDep(actionModifiedMembers);
        if(updateAllDep) {
            //update entire model - see conditions bewlo
            model.updateDependeciesForModelChange(additionalUpdatedMembers);
        }
        else {
            updateDependenciesFromAction(actionModifiedMembers);
        }

        //commit the updated impacts map (inverse of dependency map) 
        model.finalizeImpactsMap();

        //populate recalc list
        let recalculateList = createRecalculateList(actionModifiedMembers,additionalUpdatedMembers);
        
        //recalculate all needed objects
        callRecalculateList(recalculateList);

        //create the change map
        changeMap = createChangeMap(model,actionModifiedMembers,recalculateList);
    
        //fire events
        fireEvents(model,changeMap);
	}
	catch(error) {
        if(error.stack) console.error(error.stack);
        
        //unknown application error - this is fatal
        let returnValue = {};
        returnValue.actionDone = false;
        returnValue.alertMsg = "Unknown error updating model: " + error.message;
        
        model.clearCommandQueue();
        model.setActionInProgress(false);
        return returnValue;
        
    }
    
    //flag action in progress
    model.setActionInProgress(false);
    
    //trigger any pending actions
    //these will be done asynchronously
    var savedMessengerAction = model.getSavedMessengerAction();
    if(savedMessengerAction) {
        var runQueuedAction = true;

        if(model.checkConsecutiveQueuedActionLimitExceeded()) {
            //ask user if about continueing
            var doContinue = confirm("The calculation is taking a long time. Continue?");
            if(!doContinue) {
                model.setCalculationCanceled();
                runQueuedAction = false;
            }
        }

        if(runQueuedAction) {
            //FOR NOW WE WILL RUN SYNCHRONOUSLY!!!
            let childActionReturnValue = doAction(model,savedMessengerAction);

            
            if(childActionReturnValue.actionDone) {
                //merge this child return value into our main
                mergeReturnValueIntoChangeMap(model,changeMap,childActionReturnValue);
            }
            else {
                //if there is an failure in the child action, return an error for the whole action.
                let returnValue = {};
                returnValue.actionDone = false;
                returnValue.alertMsg = actionResult.alertMsg;
                return returnValue;
            }

             

            
        }
    }
    else {
        model.clearConsecutiveQueuedTracking();
    }

//##########################################
//FIRE ACTION COMPLETED EVENT HERE
//##########################################   
    
    let returnValue = {};
    returnValue.actionDone = true;
    returnValue.changeList = changeMapToChangeList(changeMap);
    return returnValue;
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
function callActionFunction(model,actionData) {

    let actionResult;

    //do the action
    var actionInfo = actionInfoMap[actionData.action];
    if(actionInfo) {
        actionResult = actionInfo.actionFunction(model,actionData,actionResult);
    }
    else {
        actionResult = {};
        actionResult.actionDone = false;
        actionResult.alertMsg = "Unknown action: " + actionData.action;
    }  

    return actionResult;
}

//=======================================
// Internal Methods
//=======================================

/** This method makes sure the member dependencies in the model are properly updated. 
 * @private */
function updateDependenciesFromAction(actionModifiedMembers) {
    //upate dependencies on table with updated code
    for(var i = 0; i < actionModifiedMembers.length; i++) {
        var actionResult = actionModifiedMembers[i];
        if((actionResult.actionDone)&&(actionResult.member)) {
            
            //initialize dependencies for this member
            if(doInitializeDependencies(actionResult)) {
                actionResult.member.initializeDependencies();
            }

            
        }
    }
}

/** This method takes the members that are updated (either by code or value) and
 * adds them to the list of members that need to be recalculated. To do this, we must
 * first have all dependencies updated, sicne it relies on the impacts list. */
function createRecalculateList(actionModifiedMembers,additionalUpdatedMembers) {
    let recalculateList = [];

    //add members from each action and/or fields they impact, if applicable
    for(var i = 0; i < actionModifiedMembers.length; i++) {
        var actionResult = actionModifiedMembers[i];
        if((actionResult.actionDone)&&(actionResult.member)) {

            //update the recalc list
            if(doAddToRecalc(actionResult)) {
                addToRecalculateList(recalculateList,actionResult.member);            
            }
            else if((doAddDependOnToRecalc(actionResult))) {
                addDependsOnToRecalculateList(recalculateList,actionResult.member);                         
            }
        }
    }

    //add any other modified members to the racalculate list
    recalculateList.push(...additionalUpdatedMembers);

    return recalculateList;
}

/** This function fires the proper events for the  It combines events to 
 * fire a single event for each member.
 * @private */
function fireEvents(model,changeMap) {
    for(var idString in changeMap) {
        let eventInfo = changeMap[idString];
        model.dispatchEvent(eventInfo.event,eventInfo);
    }
}

/** This creates the change map, which will be used to fire events and for the return value. */
function createChangeMap(model,completedResults,recalculateList) {
    var changeMap = {};
    var member;
    
    //go through explicitly called events from results
    for(var i = 0; i < completedResults.length; i++) {
        var actionResult = completedResults[i];
        var actionInfo = actionResult.actionInfo;
        
        if(actionInfo) {
            
            let eventName = actionInfo.event;
            if(!eventName) continue;
            
            let member = actionResult.member;
            
            mergeIntoChangeMap(changeMap,model,member,eventName);
        }
    }
    
    //add an update event for any object not accounted from
    for(i = 0; i < recalculateList.length; i++) {
        var member = recalculateList[i];
        mergeIntoChangeMap(changeMap,model,member,"memberUpdated");
    } 

    return changeMap;
}


function mergeReturnValueIntoChangeMap(model,changeMap,actionReturnValue) {
    if(actionReturnValue.actionDone) {
        actionReturnValue.changeList.forEach( changeItem => {
            //target is either member or model
            let member = (changeItem.target != model) ? changeItem.target : undefined;
            mergeIntoChangeMap(changeMap,model,member,changeItem.event);
        })
    }
}

/** This is a helper function to dispatch an event. */
function mergeIntoChangeMap(changeMap,model,member,eventName) {
    let targetId;
    let eventTarget;
    if(member) {
        targetId = member.getId();
        eventTarget = member;
    }
    else {
        targetId = MODEL_TARGET_ID;
        eventTarget = model;
    }
     
    var existingInfo = changeMap[targetId];
    var newInfo;
     
    if(existingInfo) {
        if((existingInfo.event == eventName)) {
            //repeat event - including case of both being "memberUpdated" or "modelUpdated"
            newInfo = existingInfo;
        }
        else if((existingInfo.event == "memberDeleted")||(eventName == "memberDeleted")) {
            newInfo =  { target: eventTarget, event: "memberDeleted" };
        }
        else if((existingInfo.event == "memberCreated")||(eventName == "memberCreated")) {
            newInfo =  { target: eventTarget, event: "memberCreated" };
        }
        else {
            //there is one more event - model updated, but it will be captured above
            //we shouldn't get here - it means we hace an unknown event type
            throw new Error("Unknown event type: " + existingInfo.event + ", " + eventName);
        }
    }
    else {
        //create event object - note we don't need the "updated" field on a delete event, but that is ok
        newInfo =  { target: eventTarget, event: eventName };
    }
     
    changeMap[targetId] = newInfo; 
}

function changeMapToChangeList(changeMap) {
    let changeList = [];
    for(let key in changeMap) {
        changeList.push(changeMap[key]);
    }
    return changeList;
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
function flattenActionResult(actionResult) {
    let completedResults = [];
    addToCompletedResultList(completedResults,actionResult);
    return completedResults;
}

function addToCompletedResultList(completedResults,actionResult) {
    completedResults.push(actionResult);
    if(actionResult.childActionResults) {
        actionResult.childActionResults.forEach( childActionResult => {
            addToCompletedResultList(completedResults,childActionResult);
        });
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
function compoundActionFunction(model,actionData) {

    let actionResult = {};
    actionResult.actionInfo = COMPOUND_ACTION_INFO;

    var actionList = actionData.actions;
    actionResult.childActionResults = [];
    for(var i = 0; i < actionList.length; i++) {
        let childActionData = actionList[i];
        let childActionResult = {};
        callActionFunction(model,childActionData,childActionResult);
        actionResult.childActionResults.push(childActionResult);   
    }
    actionResult.actionDone = true;
    return actionResult;
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

/** This is an id value used internally to signify an event acted on the model, as oposed to a specific member id. */
let MODEL_TARGET_ID = "model";


//This line of code registers the action 
addActionInfo(COMPOUND_ACTION_INFO);


