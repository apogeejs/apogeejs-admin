
apogeeapp.app.openworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.openworkspace.getOpenCallback = function(app,fileAccessObject) {
    return function() {

        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            alert("There is an open workspace. You must close the workspace first.");
            return;
        }    

        fileAccessObject.openFile(app,apogeeapp.app.openworkspace.onOpen);
    }
}

/** This method should be called when workspace data is opened, to create the workspace. */
apogeeapp.app.openworkspace.onOpen = function(err,app,workspaceData,fileMetadata) {

    if(err) {
        var actionResponse = new apogee.ActionResponse();
        var actionError = apogee.ActionError.processException(err,apogee.ActionError.ERROR_TYPE_USER,false);
        actionResponse.addError(actionError);
        apogeeapp.app.errorHandling.handleActionError(actionResponse);
    }
    else {
        //open workspace
        apogeeapp.app.openworkspace.openWorkspace(app,workspaceData,fileMetadata);
    }
}

//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
apogeeapp.app.openworkspace.openWorkspace = function(app,workspaceText,fileMetadata) {
    var actionResponse = new apogee.ActionResponse();
    var workspaceUIAdded;
    
    try {
        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            throw new Error("There is already an open workspace");
        }
        
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!  
        
        var workspaceUI = new apogeeapp.app.WorkspaceUI();
        workspaceUIAdded = app.setWorkspaceUI(workspaceUI);
    
        var referencesJson = workspaceJson.references;
        var loadReferencesPromise = workspaceUI.getLoadReferencesPromise(referencesJson);
    	
		//if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            workspaceUI.load(workspaceJson);
            workspaceUI.setFileMetadata(fileMetadata);
        }
        
        var linkLoadError = function(errorMsg) {
            alert("Error loading links: " + errorMsg);
            //we should continue with the workpace load
        }
        
        var workspaceLoadError = function(errorMsg) {
            app.clearWorkspaceUI();
            var actionError = new apogee.ActionError(errorMsg,apogee.ActionError.ERROR_TYPE_USER,false);
            actionResponse.addError(actionError);
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
        }
        
        //load references and then workspace
        //on a reference error, we continue loading the workspace
        loadReferencesPromise.catch(linkLoadError).then(doWorkspaceLoad).catch(workspaceLoadError);
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
        apogeeapp.app.errorHandling.handleActionError(actionResponse);
    }
        
    return true;
}

