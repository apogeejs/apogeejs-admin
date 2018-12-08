
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
        alert("Error: " + err.message);
    }
    else {
        var actionCompletedCallback = function(actionResponse) {
            if(!actionResponse.getSuccess()) {
                apogeeapp.app.errorHandling.handleActionError(actionResponse);
            }
        };

        //open workspace
        apogeeapp.app.openworkspace.openWorkspace(app,workspaceData,fileMetadata,actionCompletedCallback);
    }
}

//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
apogeeapp.app.openworkspace.openWorkspace = function(app,workspaceText,fileMetadata,actionCompletedCallback) {
    var actionResponse = new apogee.ActionResponse();
    var name;
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
        var loadReferencesPromise = workspaceUI.loadReferences(referencesJson);
    	
		//if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            workspaceUI.load(workspaceJson);
            workspaceUI.setFileMetadata(fileMetadata);
            actionCompletedCallback(actionResponse);
        }
        
        var linkLoadError = function(errorMsg) {
            alert("Error loading links: " + errorMsg);
            //load the workspace anyway
            doWorkspaceLoad();
        }
        
//THIS NEEDS TO BE CLEANED UP - ESPECIALLY ERROR HANDLING
        loadReferencesPromise.then(doWorkspaceLoad).catch(linkLoadError);
        
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}

