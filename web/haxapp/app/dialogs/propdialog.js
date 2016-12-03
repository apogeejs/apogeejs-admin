haxapp.app.propdialog = {};


//this is for a create or update dialog
haxapp.app.propdialog.getDialogLayout = function(workspaceUI,generator,doCreate,initialValues) {
    
    var additionalLines = hax.util.deepJsonCopy(generator.propertyDialogLines);  
    
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
    lines.push(parentLine);

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



