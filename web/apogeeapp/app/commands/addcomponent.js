

apogeeapp.app.addcomponent = {};

//=====================================
// Action
//=====================================

apogeeapp.app.addcomponent.createAddComponentCommand = function(workspaceUI,parent,componentGenerator,propertyValues,optionalBaseMemberValues,optionalBaseComponentValues,optionalOnSuccess) {
    
    //convert property values so they can be used to create the member object
    //NO - the second arg must be a complete member json!!! Not just options!
    var memberJson = componentGenerator.createMemberJson(propertyValues,optionalBaseMemberValues);
    
    //merge component property values and the base json, if needed
    var componentProperties;
    if((propertyValues)&&(optionalBaseComponentValues)) {
        componentProperties = apogeeapp.app.Component.mergePropertyValues(propertyValues,optionalBaseComponentValues);
    }
    else if(propertyValues) {
        componentProperties = propertyValues;
    }
    else {
        componentProperties = optionalBaseComponentValues;
    }
    
    var parentFullName = parent.getFullName();
    
    //create function
    var createFunction = () => apogeeapp.app.addcomponent.doAddComponent(workspaceUI,parentFullName,componentGenerator,memberJson,componentProperties,optionalOnSuccess);
    
    var workspace = workspaceUI.getWorkspace();
    var memberName = propertyValues.name;
    var memberFullName = parent.getChildFullName(memberName);
    
    //un-create function
    var deleteFunction = () => apogeeapp.app.deletecomponent.doDeleteComponent(workspace,memberFullName);
    
    var command = {};
    command.cmd = createFunction;
    command.undoCmd = deleteFunction;
    command.desc = "Create member: " + memberFullName;
    command.setsDirty = true;
    
    return command;
}

apogeeapp.app.addcomponent.doAddComponent = function(workspaceUI,parentFullName,componentGenerator,memberJson,componentProperties,optionalOnSuccess) {
    
    var workspace = workspaceUI.getWorkspace();

    //##########################################################################
    //create the member
    var createAction = {};
    createAction.action = "createMember";
    createAction.ownerName = parentFullName;
    createAction.createData = memberJson;
    var actionResult = apogee.action.doAction(workspace,createAction);
    
    //response - get new member
    var member = actionResult.member;
    var cmdDone = true;
    var errorMessage = null;
    
    //end create member
    //##########################################################################

    if(member) {
        var component;

        try {
            
            //create the component
            component = apogeeapp.app.Component.createComponentFromMember(componentGenerator,workspaceUI,member,componentProperties);

            //unknown failure
            if(!component) {
                errorMessage = "Unknown error creating component";
            }
        }
        catch(error) {
            //exception creating component
            errorMessage = "Failed to create UI component: " + error.message;
        }

        if(!component) {
            //##########################################################################
            //undo create the member
            var json = {};
            json.action = "deleteMember";
            json.memberName = member.getFullName();
            //if this fails, we will just ignore it for now
            var actionResult = apogee.action.doAction(workspace,json);
            //end undo create member
            //##########################################################################
            
            //this should have already been set
            cmdDone = false;
        }
    }
    else {
        errorMessage = actionResult.alertMsg;
    }

    if(actionResult.cmdDone) {
//NOTE - WE PROBABLY SHOULD ALLOW ERROR INFORMATION FROM optionalOnSuccess
//ALSO CONSIDIER IF THIS  SHOULD BE OUTSIDE OF ACTION (probably not, I'm thinking for now)
        if(optionalOnSuccess) optionalOnSuccess(member,component);
    }
    
    //alert user if we had an error message
    if(errorMessage) alert(errorMessage);

    return cmdDone;
}