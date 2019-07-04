

apogeeapp.app.addcomponent = {};

//=====================================
// Action
//=====================================

/** This function creates a command to add a component. */
apogeeapp.app.addcomponent.createAddComponentCommand = function(workspaceUI,parent,componentGenerator,propertyValues,optionalBaseMemberValues,optionalBaseComponentValues,optionalOnSuccess) {
    
    //convert property values so they can be used to create the member object
    //NO - the second arg must be a complete member json!!! Not just options!
    var memberJson = componentGenerator.createMemberJson(propertyValues,optionalBaseMemberValues);
    
    //merge component property values and the base json, if needed
    var componentJson;
    if((propertyValues)&&(optionalBaseComponentValues)) {
        componentJson = apogeeapp.app.Component.mergePropertyValues(propertyValues,optionalBaseComponentValues);
    }
    else if(propertyValues) {
        componentJson = apogee.util.jsonCopy(propertyValues);
    }
    else {
        componentJson = apogee.util.jsonCopy(optionalBaseComponentValues);
    }
    //##########################################
    //cludge for now - go back and fix this
    //I should pass in the type, not the generator,
    //and I should clean up how I create these properties
    //and maybe just call it the component json?
    componentJson.type = componentGenerator.uniqueName;
    //################################################
    
    var parentFullName = parent.getFullName();
    
    //create function
    var createFunction = () => apogeeapp.app.addcomponent.doAddComponent(workspaceUI,parentFullName,memberJson,componentJson,optionalOnSuccess);
    
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

apogeeapp.app.addcomponent.doAddComponent = function(workspaceUI,parentFullName,memberJson,componentProperties) {
    
    var workspace = workspaceUI.getWorkspace();

    //create the member
    var createAction = {};
    createAction.action = "createMember";
    createAction.ownerName = parentFullName;
    createAction.createData = memberJson;
    var actionResult = apogee.action.doAction(workspace,createAction);
    
    var cmdDone;
    
    //create the components for the member
    if(actionResult.actionDone) {
        apogeeapp.app.addcomponent.createComponentFromMember(workspaceUI,actionResult,componentProperties);
    }
    
    //alert user if we had an error message
    if(actionResult.errorMsg) alert(errorMsg);

    return cmdDone;
}

apogeeapp.app.addcomponent.createComponentFromMember = function(workspaceUI,createMemberResult,componentJson) {
    
    //response - get new member
    var member = createMemberResult.member;
    var component;
    var errorMessage;
    try {
        if(member) {
            
            var componentGenerator = apogeeapp.app.Apogee.getInstance().getComponentGenerator(componentJson.type);
            if((!componentGenerator)||(member.constructor == apogee.ErrorTable)) {
                //throw apogee.base.createError("Component type not found: " + componentType);

                //table not found - create an empty table
                componentGenerator = apogeeapp.app.ErrorTableComponent;
            }

            //create empty component
            var component = new componentGenerator(workspaceUI,member);

            //call member updated to process and notify of component creation
            var eventInfo = apogee.util.getAllFieldsInfo(member);
            component.memberUpdated(eventInfo);

            //apply any serialized values
            if(componentJson) {
                component.loadPropertyValues(componentJson);
            }
        }
    }
    catch(error) {
        //exception creating component
        errorMessage = "Failed to create UI component: " + error.message;
        component = null;
    }

    //I WANT BETTER ERROR HANDLING HERE (AND ABOVE)
    if(!component) {
        //##########################################################################
        //undo create the member
        var json = {};
        json.action = "deleteMember";
        json.memberName = member.getFullName();
        //if this fails, we will just ignore it for now
        var workspace = workspaceUI.getWorkspace();
        var actionResult = apogee.action.doAction(workspace,json);
        //end undo create member
        //##########################################################################

        //this should have already been set
        return false;
    }
    
    //load the children, if there are any (BETTER ERROR CHECKING!)
    if((component.readChildrenFromJson)&&(createMemberResult.childActionResults)) {      
        component.readChildrenFromJson(workspaceUI,createMemberResult.childActionResults,componentJson);
    }
        
    return true;
    
}