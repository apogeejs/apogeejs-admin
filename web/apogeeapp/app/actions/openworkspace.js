
apogeeapp.app.openworkspace = {};

//=====================================
// Action
//=====================================

apogeeapp.app.openworkspace.createOpenWorkspaceCommand = function(app,workspaceData,fileMetadata) {
    //open workspace
    var command = {};
    command.cmd =() => apogeeapp.app.openworkspace.doOpenWorkspace(app,workspaceData,fileMetadata);
    command.desc = "Open Workspace";

    return command;
}


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
apogeeapp.app.openworkspace.doOpenWorkspace = function(app,workspaceText,fileMetadata) {
    var workspaceUIAdded;
    var success = true;
    
    try {
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
            apogeeapp.app.CommandManager.errorAlert("Error loading links: " + errorMsg);
            //we should continue with the workpace load
        }
        
        var workspaceLoadError = function(errorMsg) {
            app.clearWorkspaceUI();
            apogeeapp.app.CommandManager.errorAlert(errorMsg);
            success = false;
        }
        
        //load references and then workspace
        //on a reference error, we continue loading the workspace
        loadReferencesPromise.catch(linkLoadError).then(doWorkspaceLoad).catch(workspaceLoadError);
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        apogeeapp.app.CommandManager.errorAlert("Error loading links: " + error.message);
        success = false;
    }
        
    return success;
}

