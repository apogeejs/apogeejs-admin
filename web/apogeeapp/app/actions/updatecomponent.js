

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

    var actionResponse = new apogee.ActionResponse();

    var actionList = [];
    var actionData;

    //check if a move action is needed
    if((newValues.name)||(newValues.owner)) {
        //get the new name
        var newMemberName = newValues.name ? newValues.name : member.getName();
        //get the new owner
        var newMemberOwner = newValues.parentName ? workspace.getMemberByFullName(newValues.parentName) : member.getOwner(); 
        
        actionData = {};
        actionData.action = "moveMember";
        actionData.member = member;
        actionData.name = newMemberName;
        actionData.owner = newMemberOwner;
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

    if(actionList.length > 0) {
        actionData = {};
        actionData.action = "compoundAction";
        actionData.actions = actionList;
        actionData.workspace = workspace;

        actionResponse = apogee.action.doAction(actionData,true,actionResponse);
    }
    
    //update an component additional properties
    component.loadPropertyValues(newValues);
        
    return actionResponse;
}


