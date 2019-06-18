

apogeeapp.app.updatecomponent = {};

//=====================================
// Action
//=====================================

/** This creates the command. Both the initial and full names should be passed in 
 * even is they are the same. */
apogeeapp.app.updatecomponent.createUpdatePropertyValuesCommand = function(workspaceUI,newValues,undoValues,initialFullName,targetFullName) {
    var command = {};
    command.cmd = () => apogeeapp.app.updatecomponent.doUpdatePropertyValues(workspaceUI,initialFullName,newValues);
    command.undoCmd = () => apogeeapp.app.updatecomponent.doUpdatePropertyValues(workspaceUI,targetFullName,undoValues);
    command.desc = "Update properties: " + initialFullName;
    command.setDirty = true;
    return command;
}



/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
apogeeapp.app.updatecomponent.doUpdatePropertyValues = function(workspaceUI,componentFullName,newValues) {
    
    var workspace = workspaceUI.getWorkspace();
    //get the member
    var member = workspace.getMemberByFullName(componentFullName);   
    var component = workspaceUI.getComponent(member);

    var actionList = [];
    var actionData;

    //check if a move action is needed
    if((newValues.name)||(newValues.parentName)) {
        //get the new name
        var newMemberName = newValues.name ? newValues.name : member.getName();
        //get the new owner
        var newOwnerName = newValues.parentName ? newValues.parentName : member.getParent().getFullName(); 
        
        actionData = {};
        actionData.action = "moveMember";
        actionData.memberName = componentFullName;
        actionData.targetName = newMemberName;
        actionData.targetOwnerName = newOwnerName;
        actionList.push(actionData);
    }

    //create an action to update an member additional properties
    var memberGenerator = member.generator;
    if(memberGenerator.getPropertyUpdateAction) {
        actionData = memberGenerator.getPropertyUpdateAction(member,newValues);
        if(actionData) {
           actionList.push(actionData); 
        }
    }

    var actionResult;
    if(actionList.length > 0) {
        actionData = {};
        actionData.action = "compoundAction";
        actionData.actions = actionList;

        actionResult = apogee.action.doAction(workspace,actionData);
    }
    
    //update an component additional properties
    //NEED ERROR HANDLING HERE!!!
    component.loadPropertyValues(newValues);
    
    //=================================
    //PLACE TO INSERT INTO PARENT???
    //=================================
    
        
    if(actionResult) {
        if(actionResult.alertMsg) alert(actionResult.alertMsg);
        return actionResult.actionDone;
    }
    else {
        return true;
    }
}


