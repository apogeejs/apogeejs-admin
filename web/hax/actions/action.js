
hax.action = {};

hax.action.doAction = function(workspace,actionData,optionalActionResponse) {
    var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.ActionResponse();
    
    try {   
        
        var processedActions = [];
        
        //do the action
        hax.action.callActionFunction(actionData,processedActions); 
        
        //finish processing the action
        var recalculateList = [];
        
        hax.action.updateDependencies(workspace,processedActions,recalculateList);
        
        hax.action.updateRecalculateList(processedActions,recalculateList);
        
        hax.calculation.callRecalculateList(recalculateList,actionResponse);
    
        hax.action.fireEvents(workspace,processedActions,recalculateList);
	}
	catch(error) {
        //unknown application error
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    //return response
	return actionResponse;
}


hax.action.compoundActionFunction = function(actionData,processedActions) {

    var actionList = actionData.actions;
    for(var i = 0; i < actionList.length; i++) {
        var childActionData = actionList[i];
        hax.action.callActionFunction(childActionData,processedActions);
    }
}

hax.action.callActionFunction = function(actionData,processedActions) {
    
    //do the action
    var actionInfo = hax.action.getActionInfo(actionData.action);
    if(!actionInfo) {
        actionData.actionInfo = actionInfo;
        actionInfo.actionFunction(actionData,processedActions);
    }
    else {
        actionData.error = new hax.ActionError("Unknown action: " + actionData.action,"AppException",null);
    }  
}

/** This holds the processing information for all the actions. It is set by each action. 
 * @private */
hax.action.actionInfo = {
	"compoundAction": {
		"actionFunction": hax.action.compoundActionFunction,
		"checkUpdateAll": false,
		"updateDependencies": false,
		"addToRecalc": false,
		"event": null
	}
}

hax.action.addActionInfo = function(actionName,actionInfo) {
    hax.action.actionInfo[actionName] = actionInfo;
}

hax.action.getActionInfo = function(actionName) {
    return hax.action.actionInfo[actionName];
}

hax.action.updateDependencies = function(workspace,processedActions,recalculateList) {
    //check if we need to update the entire model
    var updateAllDep = hax.action.checkUpdateAllDep(processedActions);
    if(updateAllDep) {
        //update entire model - see conditions bewlo
        workspace.updateDependeciesForModelChange(recalculateList);
    }
    else {
        //upate dependencies on table with updated code
        for(var i = 0; i < processedActions.length; i++) {
            var actionData = processedActions[i];
            if(hax.action.doInitializeDependencies(actionData)) {
                actionData.member.initializeDependencies();
            }
        }
    }
}
    
hax.action.updateRecalculateList = function(processedActions,recalculateList) {
    for(var i = 0; i < processedActions.length; i++) {
        var actionData = processedActions[i];
        if(hax.action.doAddToRecalc(actionData)) {
            hax.calculation.addToRecalculateList(recalculateList,actionData.member);            
        }
        else if((hax.action.doAddDependOnToRecalc(actionData))) {
            hax.calculation.addDependsOnToRecalculateList(recalculateList,actionData.member);                         
        }
    }
}
    
hax.action.fireEvents = function(workspace,processedActions,recalculateList) {
    
    //TEMPORARY EVENT PROCESSING - NEEDS TO BE IMPROVED
    var eventSet = {};
    var eventObject;
    var member;
    
    for(var i = 0; i < processedActions.length; i++) {
        var actionData = processedActions[i];
        
        if(actionData.actionInfo) {
            var eventName = actionData.actionInfo.event;
            if(!eventName) continue;
            
            var member = actionData.member;
            
            //get the event object
            if(actionData.eventInfo) {
                eventObject = actionData.eventInfo;
            }
            else if(member) {
                eventObject = member;
            }
            
            //fire event if we have one
            if(eventObject) {  
                hax.action.fireEvent(workspace,eventName,eventObject);
                
                //temporary processing!
                if(member) {
                    eventSet[actionData.member.getFullName()] = true;
                }
            }
        }
    }
    
    //Doh! WE NEED TO DO THIS DIFFERENTLY FOR LOTS OF REASONS
    for(i = 0; i < recalculateList.length; i++) {
        var member = recalculateList[i];
        var fullName = member.getFullName();
        if(!eventSet[fullName]) {
            hax.action.fireEvent(workspace,"updateMember",member);
        }
    } 
}

hax.action.fireEvent = function(workspace,name,data) {
    workspace.dispatchEvent(name,data);
}


hax.action.checkUpdateAllDep = function(processedActions) {
    for(var i = 0; i < processedActions.length; i++) {
        var actionData = processedActions[i];
        var member = actionData.member;
        //check update only needed for data holders (no impact for non-data holder
        if((member)&&(member.isDataHolder)) {
            if((actionData.actionInfo)&&(actionData.actionInfo.checkUpdateAll)){
                return true;
            }
        }
    }
    return false;
}

hax.action.doInitializeDependencies = function(actionData) {
    if(actionData.actionInfo) {
        return actionData.actionInfo.updateDependencies;
    }
    else {
        return false;
    }
}

hax.action.doAddToRecalc = function(actionData) {
    if(actionData.actionInfo) {
        return actionData.actionInfo.addToRecalc;
    }
    else {
        return false;
    }
}

hax.action.doAddDependOnToRecalc = function(actionData) {
    if(actionData.actionInfo) {
        return actionData.actionInfo.addDependenceiesToRecalc;
    }
    else {
        return false;
    }
}


