import {addToRecalculateList,addDependsOnToRecalculateList,callRecalculateList} from "/apogee/lib/modelCalculation.js";

/**
 * Action Module
 * An action is an operation on the data model. A mutable (unlocked) model must be passed in. 
 * After the action is completed, the model will be locked, and represent immutable data state.
 * 
 * The code in this module handles
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
 * ChangeResult:
 * The return value of the doAction function is a change result. This is a listing of all data objects whcih changed, in the success case.
 * The format is as follows:
 * Format: {
 *  actionDone: (true/false)
 *  actionPending: (Rather than actionDone, actionPending will be returned if doAction is called while another action is in
 *      process. This should only happen for actions being called by the messenger.)
 *  errorMsg: (An error message in the case actionDone is false.)
 *  model: (The model object which was acted on.)
 *  changeList: (An array of changed objects:)
 *      - event: (the change to the object: created/updated/deleted)
 *      - model: (the model, if the object was the model)
 *      - member: (the member, if the object was a member)
 * }
 *  *   "actionPending": (This flag is returned if the action is a queued action and will be run after the
 *                  current action completes.)
 * 
 * ActionResult:
 * The return value of the an action function (not the doAction function) is an ActionResult struct, with the data below. The function should return
 * an action result for each member/model that changes. There should be a single top level action result and then there can be 
 * child action results, in the childActionResults field. An important function of the action result is to tell the doAction function
 * how to calculate updates to the model based on changes to specific members. The flags recalculateMember, recalculateDependsOnMember,
 * updateMemberDependencies and updateModelDependencies serve this purpose and are described below.
 * Format: {
 *   "actionDone": (If this is returned true the action was done. This does not mean it was error free, rather
 *                  if means the action completed and can be undone. For example, it may be setting code in a member
 *                  and the code may be invalid. That is OK. It is displayed in the UI as an error and "actionDone" = true.
 *                  ActionDone should be false there was an error such that the state of the program is compromised and the 
 *                  action can not be undone. In this case, the program will keep the original state rather than adopting 
 *                  the new state the results from the action.
 *   "actionPending": (This flag is returned if the action is a queued action and will be run after the
 *                  current action completes.)
 *   "model": (The model on which the action is acting)
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
 * 
 */ 

/** This structure holds the processing information for all the actions. It is set by each action. 
 * @private */
let actionInfoMap = {
}

/** This method is used to execute an action for the data model. The model object passed in should be _unlocked_.
 * At the completion of the action, before returning, the model will be locked, meaning it can not longer be changed. */
export function doAction(model,actionData) {
    
    //only allow one action at a time
    if(model.isActionInProgress()) {
        //this is a messenger action - we will save it and execute it after this computation cycle is complete
        model.saveMessengerAction(actionData);
        
        //mark command as pending
        let changeResult = {};
        changeResult.actionPending = true;
        return changeResult;
    }
    
    //execute the main action
    let {success, errorMsg} = internalDoAction(model,actionData);
    if(!success) {
        model.clearCommandQueue();
        model.lockAll();

        let changeResult = {};
        changeResult.actionDone = false;
        changeResult.model = model;
        changeResult.errorMsg = errorMsg;
        return changeResult;
    }
    
    //trigger any pending actions
    //these will be done asynchronously
    var savedMessengerAction;
    while(savedMessengerAction = model.getSavedMessengerAction()) {
        var runQueuedAction = true;

        if(model.checkConsecutiveQueuedActionLimitExceeded()) {
            //ask user if about continueing
            var doContinue = confirm("The calculation is taking a long time. Continue?");
            if(!doContinue) {
                model.setCalculationCanceled();
                model.lockAll();

                let changeResult = {};
                changeResult.actionDone = false;
                changeResult.model = model;
                changeResult.errorMsg = "The calculation was canceled";
                return changeResult;         
            }
        }

        if(runQueuedAction) {
            //this action is run synchronously
            let {success, errorMsg} = internalDoAction(model,savedMessengerAction);
            if(!success) {
                model.clearCommandQueue();
                model.lockAll();

                let changeResult = {};
                changeResult.actionDone = false;
                changeResult.model = model;
                changeResult.errorMsg = errorMsg;
                return changeResult;
            }
        }
    }
    
    model.clearConsecutiveQueuedTracking(); 

    //check if any lazy initialized functions have not been initialized yet
    model.completeLazyInitialization();
    
    //fire the events
    let changeList = changeMapToChangeList(model.getChangeMap());
    fireEvents(model,changeList);

    //lock the model
    model.lockAll();

    //return result
    let changeResult = {};
    changeResult.actionDone = true;
    changeResult.model = model;
    changeResult.changeList = changeList;
    return changeResult;
}

/** This function is used to register an action. */
export function addActionInfo(actionName,actionFunction) {
    actionInfoMap[actionName] = actionFunction;
}

//=======================================
// Internal Methods
//=======================================

/** This method executes a single action function, */
function internalDoAction(model,actionData) {

    let success, errorMsg;

    //flag action in progress
    model.setActionInProgress(true);  

    try {

        //do the action
        let actionResult = callActionFunction(model,actionData); 
        
        //flatten action result tree into a list of objects modified in the action
        var {actionModifiedMembers, actionDone, errorMsgList} = flattenActionResult(actionResult);

        //return in the failure case
        if(actionDone) {
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
                updateDependenciesFromAction(model,actionModifiedMembers);
            }

            //commit the updated impacts map (inverse of dependency map) 
            model.finalizeImpactsMap();
            model.finalizeMemberMap();

            //populate recalc list
            let recalculateList = createRecalculateList(model,actionModifiedMembers,additionalUpdatedMembers);
            
            //recalculate all needed objects
            callRecalculateList(model,recalculateList);

            success = true;
        }
        else {
            success = false;
            errorMsg = errorMsgList.join("; ");
        }

    }
	catch(error) {
        if(error.stack) console.error(error.stack);
        success = false;
        errorMsg = "Unknown error updating model: " + error.message
    }

    //flag action in progress
    model.setActionInProgress(false);

    return {success, errorMsg};
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

/** This method makes sure the member dependencies in the model are properly updated. 
 * @private */
function updateDependenciesFromAction(model,actionModifiedMembers) {
    //upate dependencies on table with updated code
    actionModifiedMembers.forEach(actionResult => {
        if((actionResult.member)&&(actionResult.member.isCodeable)&&(actionResult.updateMemberDependencies)) {
            actionResult.member.initializeDependencies(model);
        }
    });
}

/** This method takes the members that are updated (either by code or value) and
 * adds them to the list of members that need to be recalculated. To do this, we must
 * first have all dependencies updated, sicne it relies on the impacts list. */
function createRecalculateList(model,actionModifiedMembers,additionalUpdatedMembers) {
    let recalculateList = [];

    //add members from each action and/or fields they impact, if applicable
    actionModifiedMembers.forEach( actionResult => {
        //update the recalc list
        if(actionResult.recalculateMember) {
            addToRecalculateList(model,recalculateList,actionResult.member);            
        }
        else if(actionResult.recalculateDependsOnMembers) {
            addDependsOnToRecalculateList(model,recalculateList,actionResult.member);                         
        }
    });

    //add any other modified members to the racalculate list
    additionalUpdatedMembers.forEach(member => addToRecalculateList(model,recalculateList,member));

    return recalculateList;
}

/** This function fires the proper events for the  It combines events to 
 * fire a single event for each member.
 * @private */
function fireEvents(model,changeList) {
    changeList.forEach(changeListEntry => {
        model.dispatchEvent(changeListEntry.event,changeListEntry.instance);
    });
}

function changeMapToChangeList(changeMap) {
    let changeList = [];
    for(let id in changeMap) {
        let changeMapEntry = changeMap[id];

        //ignore the transient objects
        if(changeMapEntry.action == "transient") continue;

        let changeListEntry = {};
        changeListEntry.event = changeMapEntry.instance.getType() + "_" + changeMapEntry.action;
        changeListEntry.instance = changeMapEntry.instance;
        changeList.push(changeListEntry);
    }
    return changeList;
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
        let childActionResult = callActionFunction(model,childActionData);
        actionResult.childActionResults.push(childActionResult);   
    }
    actionResult.actionDone = true;
    return actionResult;
}

//This line of code registers the action 
addActionInfo("compoundAction",compoundActionFunction);


