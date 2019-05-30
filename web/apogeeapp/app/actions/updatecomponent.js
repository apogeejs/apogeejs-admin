

apogeeapp.app.updatecomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
apogeeapp.app.updatecomponent.updateComponent = function(component) {
    
    var componentGenerator = component.componentGenerator;

    var displayName = componentGenerator.displayName
    var additionalLines = apogee.util.jsonCopy(componentGenerator.propertyDialogLines); 

    var workspaceUI = component.getWorkspaceUI(); 
    var initialValues = component.getPropertyValues(); 

    //add folder list, only if we can set the parent (if there is a parent)
    var folderMap = null;
    var folderList = null;
    if(component.getMember().getParent()) {
        //get the folder list
         folderMap = workspaceUI.getFolders();
        folderList = [];
        for(var folderName in folderMap) {
            folderList.push(folderName);
        }
    }

    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = apogeeapp.app.updatecomponent.getPropertiesDialogLayout(displayName,folderList,additionalLines,false,initialValues);

    //create on submit callback
    var onSubmitFunction = function(submittedValues) {

        //see if there were no changes
        var change = false;
        var newValues = {};
        var undoValues = {}
        for(var key in submittedValues) {
            if(submittedValues[key] !== initialValues[key]) {
                newValues[key] = submittedValues[key];
                undoValues[key] = initialValues[key];
                change = true;
            }
        }
        if(!change) {
            return true;
        }

        var nameChange = false;
        var targetName;
        var targetOwner;
        var member = component.getMember();
        
        //validate the name, if it changed
        if(newValues.name !== undefined) {
            //validate name
            var nameResult = apogee.codeCompiler.validateTableName(newValues.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }
            
            targetName = newValues.name;
            nameChange = true;
        }
        else {
            targetName = member.getName();
        }

        //make sure the parent is value
        if((folderMap)&&(newValues.parentName)) {

            if(newValues.parentName == component.getMember().getFullName()) {
                alert("Illegal destination: you put an object inside itself");
                return false;
            }
              
            targetOwner = folderMap[newValues.parentName];
            nameChange = true;
        }
        else {
            targetOwner = member.getOwner();
        }

        //need to test if other fields are valid!
        
        var initialFullName = component.getMember().getFullName();
        var targetFullName;
        if(nameChange) { 
            //this will be the new full name
            targetFullName = targetOwner.getChildFullName(targetName);
        }
        else {
            targetFullName = initialFullName;
        }

        //update command
        var workspaceUI = component.getWorkspaceUI();     
        var command = apogeeapp.app.updatecomponent.createUpdatePropertyValuesCommand(workspaceUI,newValues,undoValues,initialFullName,targetFullName);
        workspaceUI.getApp().executeCommand(command);

        //return true to close the dialog
        return true;
    }

    //show dialog
    apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
}

/** This creates the command. Both the initial and full names should be passed in 
 * even is they are the same. */
apogeeapp.app.updatecomponent.createUpdatePropertyValuesCommand = function(workspaceUI,newValues,undoValues,initialFullName,targetFullName) {
    var command = {};
    command.cmd = () => apogeeapp.app.updatecomponent.updatePropertyValues(workspaceUI,initialFullName,newValues);
    command.undoCmd = () => apogeeapp.app.updatecomponent.updatePropertyValues(workspaceUI,targetFullName,undoValues);
    command.desc = "Update properties: " + initialFullName;
    return command;
}
//=====================================
// Action
//=====================================


/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
apogeeapp.app.updatecomponent.updatePropertyValues = function(workspaceUI,componentFullName,newValues) {
    
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

//========================
// dialog setup - this is shared with add component since it is the same basic action
//========================

//this is for a create or update dialog
//omit folder names (null) and folder initial value to omit the parent selection
apogeeapp.app.updatecomponent.getPropertiesDialogLayout = function(displayName,folderNames,additionalLines,doCreate,initialValues) { 
    
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    if(doCreate) {
        titleLine.title = "New " + displayName;
    }
    else {
        titleLine.title = "Update " + displayName; 
    }
    lines.push(titleLine);

    if(folderNames) {
        var parentLine = {};
        parentLine.type = "dropdown";
        parentLine.heading = "Folder: ";
        parentLine.entries = folderNames;
        parentLine.resultKey = "parentName"; 
        lines.push(parentLine);
    }

    var nameLine = {};
    nameLine.type = "inputElement";
    nameLine.heading = "Name: ";
    nameLine.resultKey = "name";
    lines.push(nameLine);
    
    //add additioanl lines, if applicable
    if(additionalLines) {
        for(var i = 0; i < additionalLines.length; i++) {
            lines.push(additionalLines[i]);
        }
    }

    //submit
    var submitLine = {};
    submitLine.type = "submit";
    if(doCreate) {
        submitLine.submit = "Create";
    }
    else {
        submitLine.submit = "Update";
    }
    submitLine.cancel = "Cancel";
    lines.push(submitLine);
    
    //set the initial values
    if(initialValues) {
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.resultKey) {
                line.initial = initialValues[line.resultKey];
            }
        }
    }
    
    return dialogLayout;
}









