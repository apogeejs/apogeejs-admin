

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
    
    return command;
}

apogeeapp.app.addcomponent.doAddComponent = function(workspaceUI,parentFullName,componentGenerator,memberJson,componentProperties,optionalOnSuccess) {
    
    var workspace = workspaceUI.getWorkspace();
    var parent = workspace.getMemberByFullName(parentFullName);

    //create the member
    var createAction = {};
    createAction.action = "createMember";
    createAction.owner = parent;
    createAction.workspace = workspace;
    createAction.createData = memberJson;
    var actionResponse = apogee.action.doAction(createAction,true);
    var member = createAction.member;

    if(member) {
        var component;

        try {
            
            //create the component
            component = apogeeapp.app.Component.createComponentFromMember(componentGenerator,workspaceUI,member,componentProperties);

            //unknown failure
            if(!component) {
                var message = "Unknown error creating component";
                var actionError = new apogee.ActionError(message,apogee.ActionError.ERROR_TYPE_APP);
                actionResponse.addError(actionError);
            }
        }
        catch(error) {
            //exception creating component
            var message = "Failed to create UI component: " + error.message;
            var actionError = new apogee.ActionError(message,apogee.ActionError.ERROR_TYPE_APP);
            actionResponse.addError(actionError);
        }

        if(!component) {
            //delete the already created member
            var json = {};
            json.action = "deleteMember";
            json.member = member;
            //if this fails, we will just ignore it for now
            apogee.action.doAction(json,true);
        }


    }

    if(actionResponse.getSuccess()) {
//NOTE - WE PROBABLY SHOULD ALLOW ERROR INFORMATION FROM optionalOnSuccess
//ALSO CONSIDIER IF THIS  SHOULD BE OUTSIDE OF ACTION (probably not, I'm thinking for now)
        if(optionalOnSuccess) optionalOnSuccess(member,component);
    }

    return actionResponse;
}