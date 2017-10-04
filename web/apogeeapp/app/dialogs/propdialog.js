apogeeapp.app.propdialog = {};


//this is for a create or update dialog
//omit folder names (null) and folder initial value to omit the parent selection
apogeeapp.app.propdialog.getDialogLayout = function(displayName,folderNames,additionalLines,doCreate,initialValues) { 
    
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



