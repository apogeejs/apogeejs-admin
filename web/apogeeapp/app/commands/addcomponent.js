

apogeeapp.app.addcomponent = {};

//=====================================
// Command Object
//=====================================

apogeeapp.app.addcomponent.createUndoCommand = function(workspaceUI,commandJson) {
    
    var workspace = workspaceUI.getWorkspace();
    var memberName = commandJson.memberJson.name;
    var parent = workspace.getMemberByFullName(commandJson.parentFullName);
    var memberFullName = parent.getChildFullName(memberName);
    
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.deletecomponent.COMMAND_TYPE;
    undoCommandJson.memberFullName = memberFullName;
    
    return undoCommandJson;
}

apogeeapp.app.addcomponent.executeCommand = function(workspaceUI,commandJson) { 
    
    var workspace = workspaceUI.getWorkspace();

    //create the member
    var createAction = {};
    createAction.action = "createMember";
    createAction.ownerName = commandJson.parentFullName;
    createAction.createData = commandJson.memberJson;
    var actionResult = apogee.action.doAction(workspace,createAction);
    
    var cmdDone;
    
    //create the components for the member
    //I need error handling for the create component action
    if(actionResult.actionDone) {
        apogeeapp.app.addcomponent.createComponentFromMember(workspaceUI,actionResult,commandJson.componentProperties);
    }

    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

//==========================
// Internal Methods
//==========================

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

apogeeapp.app.addcomponent.COMMAND_TYPE = "addComponent";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.addcomponent);