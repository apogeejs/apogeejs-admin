
apogeeapp.app.openworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.openworkspace.getOpenCallback = function(app) {
    return function() {
    
        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            alert("There is already an open workspace. You must close the workspace first.");
            return;
        }
    
        var onOpen = function(err,workspaceData,workspaceHandle) {
            
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
                apogeeapp.app.openworkspace.openWorkspace(app,workspaceData,workspaceHandle,actionCompletedCallback);
            }
        }    
        
        apogeeapp.app.openworkspace.openFile(onOpen);
    }
}

//THIS FUNCTION MUST BE IMPLEMENTED!
//apogeeapp.app.openworkspace.openFile(onOpen);

//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
apogeeapp.app.openworkspace.openWorkspace = function(app,workspaceText,workspaceHandle,actionCompletedCallback) {
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
    
        var libraryJson = workspaceJson.library;
        var loadLibraryPromise = workspaceUI.loadLibrary(libraryJson);
    	
		//if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            workspaceUI.load(workspaceJson);
            actionCompletedCallback(actionResponse);
        }
        
        var linkLoadError = function(errorMsg) {
            alert("Error loading links: " + errorMsg);
            //load the workspace anyway
            doWorkspaceLoad();
        }
        
//THIS NEEDS TO BE CLEANED UP - ESPECIALLY ERROR HANDLING
        loadLibraryPromise.then(doWorkspaceLoad).catch(linkLoadError);
        
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

//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.openworkspace.openWorkspaceFromUrl = function(app,url) {
    var actionCompletedCallback = function(actionResponse) {
        if(!actionResponse.getSuccess()) {
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
        }
    };
    
    apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl(app,url,actionCompletedCallback);
}

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl = function(app,url,actionCompletedCallback) {
    var onDownload = function(workspaceText) {
        apogeeapp.app.openworkspace.openWorkspace(app,workspaceText,url,actionCompletedCallback);
    }
    
    var onFailure = function(msg) {
        var actionError = new apogee.ActionError(msg,apogee.ActionError.ERROR_TYPE_APP,null);
        var actionResponse = new apogee.ActionResponse();
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }   
    apogeeapp.app.openworkspace.doRequest(url,onDownload,onFailure);   
}

/**
 * This is an http request for the worksheet data
 */
apogeeapp.app.openworkspace.doRequest= function(url,onDownload,onFailure) {
	var xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function() {
        var msg;
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            onDownload(xmlhttp.responseText);
        }
        else if(xmlhttp.readyState==4  && xmlhttp.status >= 400)  {
            msg = "Error in http request. Status: " + xmlhttp.status;
            onFailure(msg);
        }
    }
	
	xmlhttp.open("GET",url,true);
    xmlhttp.send();
}