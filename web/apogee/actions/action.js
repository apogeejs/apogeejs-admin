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
 * the name of the action and the function taht executes the action. The function
 * should be of the form: 
 * actionResult = function actionFunction(model,actionData)
 * 
 * Action Data Format:
 * The action data is used to pass data into the action specific code, Format:
 * actionData format: {
 *   "action": (The name of the action to execute),
 *   "member": (The data object that is acted upon , if applicable),
 *   (other, multiple): (Specific data for the action)
 * }
 * 
 * ActionResult:
 * The return value of the doAction function is an ActionResult struct, with the data below. The function should return
 * an action result for each member/model that changes. There should be a single top level action result and then there can be 
 * child action results, in the childActionResults field.
 * Format: {
 *   "actionDone": (If this is returned true the action was done. This does not mean it was error free, rather
 *                  if means the action completed and can be undone. For example, it may be setting code in a member
 *                  and the code may be invalid. That is OK. It is displayed in the UI as an error and "actionDone" = true.
 *                  ActionDone should be false there was an error such that the state of the program is compromised and the 
 *                  action can not be undone. In this case, the program will keep the original state rather than adopting 
 *                  the new state the results from the action.
 *   "actionPending": (This flag is returned if the action is a queued action and will be run after the
 *                  current action completes.)
 *   "member": (The object modified in the action, if it is a member. Another option is a model update, in which 
 *                  case this field is left undefined, but a model event will be included. It is also possible that
 *                  there is no member listed because the action result does not corrspond to an action on a member of 
 *                  the model. This is true on the top level result of a compound action.)
 *   "event": (This is the event that should be fired as a result of this action/actionResult. The options are:
 *                  "created", "updated" and "deleted".)
 *   "errorMsg": (This is the error message for is the actionDone is false)
 *   "childActionResults" - (This is a list of action results if there are additional child actions done with this
 *                  action. Examples where this is used are on creating, moving or deleting a folder that has chilren.)
 *   "recalculateMember" - (This is an optional action flag. The is set of the member is a dependent and it must be recalculated.)
 *   "recalculateDependsOnMember" - (This is an optional action flag. This is set if the member has its value changed, but the 
 *                  member does not need to be recalculated. The members that depend on this do however need to be recalculated.)
 *   "updateMemberDependencies" - (This is an optional action flag. The is set of the member is a dependent and it must have its dependencies
 *                  recalculated, such as if the code changes.)
 *   "updateModelDepedencies" - (This is an optional action flag. The is set of the member is a dependent and it is created, deleted or moved.
 *                  In this case, all members in the model should be checked to see if they have any dependency changes.)
 * }
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
        let changeResult = {};
        changeResult.actionPending = true;
        return changeResult;
    }
    
    //flag action in progress
    model.setActionInProgress(true);

//##########################################
//FIRE ACTION START EVENT HERE
//##########################################    

    try {   
        
        //do the action
        let actionResult = callActionFunction(model,actionData); 
        
        //flatten action result tree into a list of objects modified in the action
        var {actionModifiedMembers, actionDone, errorMsgList} = flattenActionResult(actionResult);

        //return in the failure case
        if(!actionDone) {
            let changeResult = {};
            changeResult.actionDone = false;
            changeResult.errorMsgs = errorMsgList;

            //clear any queued commands
            model.clearCommandQueue();
            model.setActionInProgress(false);
            
            return changeResult;
        }

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
        let changeResult = {};
        changeResult.actionDone = false;
        changeResult.errorMsgs = ["Unknown error updating model: " + error.message];
        
        model.clearCommandQueue();
        model.setActionInProgress(false);
        return changeResult;
        
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
                let changeResult = {};
                changeResult.actionDone = false;
                changeResult.errorMsgs = ["The calculation was canceled"];

                model.setCalculationCanceled();

                return changeResult;         
            }
        }

        if(runQueuedAction) {
            //FOR NOW WE WILL RUN SYNCHRONOUSLY!!!
            let childActionChangeResult = doAction(model,savedMessengerAction);

            //merge this child return value into our main
            mergeReturnValueIntoChangeMap(model,changeMap,childActionChangeResult);

            if(!childActionChangeResult.actionDone) {
                //if there is an failure in the child action, return an error for the whole action.
                let changeResult = {};
                changeResult.actionDone = false;
                changeResult.errorMsg = childActionChangeResult.errorMsg;
                
                model.clearCommandQueue();

                return changeResult;
            }  
        }
    }
    else {
        model.clearConsecutiveQueuedTracking();
    }

//##########################################
//FIRE ACTION COMPLETED EVENT HERE
//##########################################   
    
    let changeResult = {};
    changeResult.actionDone = true;
    changeResult.changeList = changeMapToChangeList(changeMap);
    return changeResult;
}

/** This function is used to register an action. */
export function addActionInfo(actionName,actionFunction) {
    actionInfoMap[actionName] = actionFunction;
}

/** This function looks up the proper function for an action and executes it. */
function callActionFunction(model,actionData) {

    let actionResult;

    //do the action
    var actionFunction = actionInfoMap[actionData.action];
    if(actionFunction) {
        actionResult = actionFunction(model,actionData);
    }
    else {
        actionResult = {};
        actionResult.actionDone = false;
        actionResult.errorMsg = "Unknown action: " + actionData.action;
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
    actionModifiedMembers.forEach(actionResult => {
        if((actionResult.member)&&(actionResult.member.isCodeable)&&(actionResult.updateMemberDependencies)) {
            actionResult.member.initializeDependencies();
        }
    });
}

/** This method takes the members that are updated (either by code or value) and
 * adds them to the list of members that need to be recalculated. To do this, we must
 * first have all dependencies updated, sicne it relies on the impacts list. */
function createRecalculateList(actionModifiedMembers,additionalUpdatedMembers) {
    let recalculateList = [];

    //add members from each action and/or fields they impact, if applicable
    for(var i = 0; i < actionModifiedMembers.length; i++) {
        var actionResult = actionModifiedMembers[i];
 
        //update the recalc list
        if(actionResult.recalculateMember) {
            addToRecalculateList(recalculateList,actionResult.member);            
        }
        else if(actionResult.recalculateDependsOnMembers) {
            addDependsOnToRecalculateList(recalculateList,actionResult.member);                         
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
        let changeMapEntry = changeMap[idString];
        let changeListEntry = changeMapEntryToChangeListEntry(changeMapEntry);
        model.dispatchEvent(changeListEntry.event,changeListEntry);
    }
}

/** This creates the change map, which will be used to fire events and for the return value. */
function createChangeMap(model,completedResults,recalculateList) {
    var changeMap = {};
    var member;
    
    //go through explicitly called events from results
    for(var i = 0; i < completedResults.length; i++) {
        var actionResult = completedResults[i];
        
        if(actionResult.event) {
            mergeIntoChangeMap(changeMap,model,actionResult.member,actionResult.event);
        }
    }
    
    //add an update event for any object not accounted from
    for(i = 0; i < recalculateList.length; i++) {
        var member = recalculateList[i];
        mergeIntoChangeMap(changeMap,model,member,"updated");
    } 

    return changeMap;
}


function mergeReturnValueIntoChangeMap(model,changeMap,actionReturnValue) {
    if(actionReturnValue.actionDone) {
        actionReturnValue.changeList.forEach( changeItem => {
            //target is either member or model
            mergeIntoChangeMap(changeMap,model,changeItem.member,changeItem.event);
        })
    }
}

/** This is a helper function to dispatch an event. */
function mergeIntoChangeMap(changeMap,model,member,eventName) {
    //action target is either the member, if defined, or the model
    let actionTarget = member ? member : model;
    let lookupKey = actionTarget.getTargetType() + actionTarget.getId();
    var existingInfo = changeMap[lookupKey];
    if(!existingInfo) {
        existingInfo = {};
        if(member) existingInfo.member = member;
        else existingInfo.model = model;
        changeMap[lookupKey] = existingInfo;
    }

    //record the event type
    existingInfo[eventName] = true;
}

function changeMapToChangeList(changeMap) {
    let changeList = [];
    for(let key in changeMap) {
        let changeListEntry = changeMapEntryToChangeListEntry(changeMap[key]);
        if(changeListEntry) changeList.push(changeListEntry);
    }
    return changeList;
}

function changeMapEntryToChangeListEntry(changeMapEntry) {
    let changeListEntry = {};

    //member present only if the member is the event target
    if(changeMapEntry.member) {
        changeListEntry.member = changeMapEntry.member;
    }
    else if(changeMapEntry.model) {
        changeListEntry.model = changeMapEntry.model;
    }
    //merge the events into a single event
    if((changeMapEntry.created)&&(changeMapEntry.deleted)) return null;
    else if(changeMapEntry.created) changeListEntry.event = "created";
    else if(changeMapEntry.deleted) changeListEntry.event = "deleted";
    else if(changeMapEntry.updated) changeListEntry.event = "updated";
    else return null;

    return changeListEntry;
}

/** This method determines if updating all dependencies is necessary. Our dependency 
 * tracking may be in error if a new member is created, a member is deleted or
 * a member is moved. In these actions we flag that the entire model should be
 * updated.*/
function checkUpdateAllDep(completedResults) {
    //return true if any results have the updateModelDependencies flag set
    return completedResults.some(result => result.updateModelDependencies)
}

/** This method unpacks the actionResult and its child reponse into an array of actionResult. */
function flattenActionResult(actionResult) {
    let actionResultInfo = {};
    actionResultInfo.actionModifiedMembers = [];
    actionResultInfo.actionDone = true;
    actionResultInfo.errorMsgList = [];

    addToCompletedResultList(actionResultInfo,actionResult);

    return actionResultInfo;
}

function addToCompletedResultList(actionResultInfo,actionResult) {
    actionResultInfo.actionModifiedMembers.push(actionResult);
    if(!actionResult.actionDone) actionResultInfo.actionDone = false;
    if(actionResult.errorMsgList) actionResultInfo.errorMsgList.push(actionResult.errorMsg);

    if(actionResult.childActionResults) {
        actionResult.childActionResults.forEach( childActionResult => {
            addToCompletedResultList(actionResultInfo,childActionResult);
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


