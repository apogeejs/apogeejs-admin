

apogeeapp.app.updatecomponentseq = {};

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
apogeeapp.app.updatecomponentseq.updateComponent = function(component) {
    
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
    var dialogLayout = apogeeapp.app.updatecomponentseq.getPropertiesDialogLayout(displayName,folderList,additionalLines,false,initialValues);

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

//========================
// dialog setup - this is shared with add component since it is the same basic action
//========================

//this is for a create or update dialog
//omit folder names (null) and folder initial value to omit the parent selection
apogeeapp.app.updatecomponentseq.getPropertiesDialogLayout = function(displayName,folderNames,additionalLines,doCreate,initialValues) { 
    
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









