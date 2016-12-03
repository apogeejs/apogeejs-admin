
hax.action = {};

hax.action.createCompletedActionsObject = function() {
    return [];
}

hax.action.addActionInfo = function(completedActions,actionInfo) {
    completedActions.push(actionInfo);
}

hax.action.addAction = function(completedActions,member,action) {
    var actionInfo = {};
    actionInfo.member = member;
    actionInfo.action = action;
    completedActions.push(actionInfo);
}

//Create
//Delete
//Move
//UpdateCode
//UpdateData
//AsynchUpdateData



hax.action.finalizeAction = function(workspace,completedActions,actionResponse) {
    var recalculateList = [];
    var i;
    var actionInfo;
    
    //------------------------
    //update dependency info 
    //------------------------
    //check if we need to update the entire model
    var updateAllDep = hax.action.checkUpdateAllDep(completedActions);
    if(updateAllDep) {
        //update entire model - see conditions bewlo
        workspace.updateDependeciesForModelChange(recalculateList);
    }
    else {
        //upate dependencies on table with updated code
        for(i = 0; i < completedActions.length; i++) {
            actionInfo = completedActions[i];
            if(actionInfo.action == "updateCode") {
                actionInfo.member.initializeDependencies();
            }
        }
    }
    
    //------------------------
    //set up recalc list
    //------------------------
    for(i = 0; i < completedActions.length; i++) {
        actionInfo = completedActions[i];
        switch(actionInfo.action) {
            case "create":
            case "updateCode":
            case "move":
                hax.calculation.addToRecalculateList(recalculateList,actionInfo.member);            
                break;
                
            case "updateData":
            case "asynchUpdateData":
                hax.calculation.addDependsOnToRecalculateList(recalculateList,actionInfo.member);               
                break;             
        }
    }
    
    hax.calculation.callRecalculateList(recalculateList,actionResponse);
    
    //------------------------
    //fire events - doh! order might matter. Check this out.
    //------------------------
    for(i = 0; i < completedActions.length; i++) {
        actionInfo = completedActions[i];
        switch(actionInfo.action) {
            case "create":
                hax.createmember.fireCreatedEvent(actionInfo.member);
                break;
              
            case "updateCode":
            case "updateData":
            case "asynchUpdateData":
                hax.updatemember.fireUpdatedEvent(actionInfo.member);               
                break; 
                
            case "move":
                //pass info, not the member
                hax.movemember.fireMovedEvent(actionInfo);            
                break;
                
            case "delete":
                //pass info, not the member
                hax.createmember.fireDeletedEvent(actionInfo);
                break;
        }
    }
    
    //Doh! WE NEED TO DO THIS DIFFERENTLY FOR LOTS OF REASONS
    for(i = 0; i < recalculateList.length; i++) {
        hax.updatemember.fireUpdatedEvent(recalculateList[i]);
    }
    
}

/** If there was a create, move or delete, meaning the model variables
 *  are different, we will check to update the entire workspace
 */
hax.action.checkUpdateAllDep = function(completedActions) {
    for(var i = 0; i < completedActions.length; i++) {
        var actionInfo = completedActions[i];
        if((actionInfo.action == "create")||(actionInfo.action == "move")||(actionInfo.action == "delte")) {
            return true;
        }
    }
    return false;
}


