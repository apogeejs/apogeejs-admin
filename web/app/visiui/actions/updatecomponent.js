

hax.app.visiui.updatecomponent = {};

//=====================================
// UI Entry Point
//=====================================

hax.app.visiui.updatecomponent.getAddComponentCallback = function(app,generator,optionalInitialValues,optionalComponentOptions) {
    
    var createCallback = function() {
        //get the active workspace
        var workspaceUI = app.getActiveWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        
        var additionalLines = hax.core.util.deepJsonCopy(generator.propertyDialogLines);       
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = hax.app.visiui.updatecomponent.getDialogLayout(workspaceUI,generator,true,additionalLines,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(result) {
            
            //need to test if fields are valid!

            var actionResponse =  generator.createComponent(workspaceUI,result,optionalComponentOptions);   
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        hax.app.visiui.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

hax.app.visiui.updatecomponent.getUpdateComponentCallback = function(component,generator) {
    
    var createCallback = function() {
    
        var additionalLines = generator.propertyDialogLines;
        
        var workspaceUI = component.getWorkspaceUI();       
        var initialValues = component.getPropertyValues();
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = hax.app.visiui.updatecomponent.getDialogLayout(workspaceUI,generator,false,additionalLines,initialValues);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {
            
            //see if there were no changes
            var change = false;
            for(var key in newValues) {
                if(newValues[key] !== initialValues[key]) change = true;
            }
            if(!change) {
                return true;
            }
            
            //need to test if fields are valid!

            //update
            var actionResponse;
            if((newValues.name !== initialValues.name)||(newValues.parentKey != initialValues.parentKey)) {
                //handle refactor, with property change
                alert("This shouldn't happen - how did the name or fodler change?");
                return true;
            }
            else {
                //only property change
                actionResponse = component.updatePropertyValues(newValues);
            }
              
            //print an error message if there was an error
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        hax.app.visiui.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

//this is for a create or update dialog
hax.app.visiui.updatecomponent.getDialogLayout = function(workspaceUI,generator,doCreate,additionalLines,initialValues) {
    
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    if(doCreate) {
        titleLine.title = "New " + generator.displayName;
    }
    else {
        titleLine.title = "Update " + generator.displayName; 
    }
    lines.push(titleLine);

    var parentLine = {};
    parentLine.type = "dropdown";
    parentLine.heading = "Folder: ";
    parentLine.entries = workspaceUI.getFolderList();
    parentLine.resultKey = "parentKey"; 
    if(!doCreate) {
        //do not allow editing after create, for now
        parentLine.disabled = true;
    }
    lines.push(parentLine);

    var nameLine = {};
    nameLine.type = "inputElement";
    nameLine.heading = "Name: ";
    nameLine.resultKey = "name";
    if(!doCreate) {
        //do not allow editing after create, for now
        nameLine.disabled = true;
    }
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

//=====================================
// Action
//=====================================

//action is in the component generator






