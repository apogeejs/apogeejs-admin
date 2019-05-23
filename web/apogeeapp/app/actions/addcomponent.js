

apogeeapp.app.addcomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This functions initiates the add component action. */   
apogeeapp.app.addcomponent.addComponent = function(app,componentGenerator,optionalInitialValues,optionalMemberOptions,optionalComponentJson,optionalOnSuccess) {

        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        var displayName = componentGenerator.displayName
        var additionalLines = apogee.util.jsonCopy(componentGenerator.propertyDialogLines); 
        
        //get the folder list
        var folderMap = workspaceUI.getFolders();
        var folderList = [];
        for(var folderName in folderMap) {
            folderList.push(folderName);
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = apogeeapp.app.updatecomponent.getPropertiesDialogLayout(displayName,folderList,additionalLines,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(userInputValues) {
            
            //validate name
            var nameResult = apogee.codeCompiler.validateTableName(userInputValues.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }
            
            //get the parent object
            var parent = folderMap[userInputValues.parentName]; 
            
            //add the component
            var command = apogeeapp.app.addcomponent.createAddComponentCommand(workspaceUI,parent,componentGenerator,userInputValues,optionalMemberOptions,optionalComponentJson,optionalOnSuccess);
            workspaceUI.getApp().executeCommand(command);
            
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
}

/** This gets a callback to add an "additional" component, menaing one that is not
 * in the main component menu. */
apogeeapp.app.addcomponent.addAdditionalComponent = function(app,optionalInitialValues,optionalMemberOptions,optionalComponentJson) {
        
    var onSelect = function(componentType) {
        var componentGenerator = app.getComponentGenerator(componentType);
        if(componentGenerator) {
            apogeeapp.app.addcomponent.addComponent(app,componentGenerator,optionalInitialValues,optionalMemberOptions,optionalComponentJson);
        }
        else {
            alert("Unknown component type: " + componentType);
        }
    }
    //get the display names
    var componentNames = app.additionalComponents.map(componentClassName => {
        var generator = app.getComponentGenerator(componentClassName);
        if(generator) {
            return generator.displayName;
        }
        else {
            return componentClassName + " (ERROR - not found!)";
        }
    })
    //open select component dialog
    apogeeapp.app.dialog.showSelectComponentDialog(componentNames,app.additionalComponents,onSelect);
}

//=====================================
// Action
//=====================================

apogeeapp.app.addcomponent.createAddComponentCommand = function(workspaceUI,parent,componentGenerator,initialValues,optionalMemberOptions,optionalComponentJson,optionalOnSuccess) {
    
    //convert property values so they can be used to create the member object
    //NO - the second arg must be a complete member json!!! Not just options!
    var memeberJson = componentGenerator.getCreateMemberPayload(initialValues,optionalMemberOptions);
    
    //convert property values so they can be used to create the component object
    var componentJson;
    if(!optionalComponentJson) {
        componentJson = {};
    }
    else {
        componentJson = apogee.util.jsonCopy(optionalComponentJson);
    }
    if(componentGenerator.mergePropertiesToSourceJson) {
        componentGenerator.mergePropertiesToSourceJson(initialValues,optionalComponentJson)
    }
    
    //create function
    var createFunction = () => apogeeapp.app.addcomponent.doAddComponent(workspaceUI,parent,componentGenerator,memberJson,componentJson,optionalOnSuccess);
    
    var workspace = workspaceUI.getWorkspace();
    var memberName = initialValues.name;
//WE NEED THE PROPER WAY OF DOING THIS!!! - HERE I AM COPYING CODE FROM ELSEWHERE. FIX THIS!!!
    var memberFullName = parent.getPossesionNameBase() + memberName;
    
    //un-create function
    var deleteFunction = () => apogeeapp.app.deletecomponent.doDeleteComponent(workspace,memberFullName);
    
    var command = {};
    command.cmd = createFunction;
    command.undoCmd = deleteFunction;
    command.desc = "Create member: " + memberFullName;
    
    return command;
}

apogeeapp.app.addcomponent.doAddComponent = function(workspaceUI,parent,componentGenerator,memberJson,componentJson,optionalOnSuccess) {

    //create the member
    var createAction = {};
    createAction.action = "createMember";
    createAction.owner = parent;
    createAction.workspace = parent.getWorkspace();
    createAction.createData = memberJson;
    var actionResponse = apogee.action.doAction(createAction,true);
    var member = createAction.member;

    if(member) {
        var component;

        try {
            
            //create the component
            component = apogeeapp.app.Component.createComponentFromMember(componentGenerator,workspaceUI,member,componentJson);

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