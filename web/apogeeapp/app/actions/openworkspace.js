
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
                        alert(actionResponse.getErrorMsg());
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
    
        //add links, if applicable
		var jsLinks;
		var cssLinks;
        var linksAdded = false;
        if((workspaceJson.jsLinks)&&(workspaceJson.jsLinks.length > 0)) {
            jsLinks = workspaceJson.jsLinks;
            linksAdded = true;
        }
		else {
			jsLinks = [];
		}
        if((workspaceJson.cssLinks)&&(workspaceJson.cssLinks.length > 0)) {
			cssLinks = workspaceJson.cssLinks;
            linksAdded = true;
        }
		else {
			cssLinks = [];
		}
    	
		//if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            apogeeapp.app.openworkspace.loadWorkspace(workspaceUI,workspaceJson);
            actionCompletedCallback(actionResponse);
        }
        
        if(linksAdded) {
			workspaceUI.setLinks(jsLinks,cssLinks,doWorkspaceLoad);
		}
		else {
			//immediately load the workspace - no links to wait for
            doWorkspaceLoad();
		}
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        var actionError = apogee.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}

/** This method loads an existing workspace into an empty workspace UI. */
apogeeapp.app.openworkspace.loadWorkspace = function(workspaceUI,workspaceJson,actionResponse) {
    var workspaceDataJson = workspaceJson.workspace;
    var workspaceComponentsJson = workspaceJson.components;

    var workspace = new apogee.Workspace(workspaceDataJson,actionResponse);
    
    workspaceUI.setWorkspace(workspace,workspaceComponentsJson);
}


//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.openworkspace.openWorkspaceFromUrl = function(app,url) {
    var actionCompletedCallback = function(actionResponse) {
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
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
        var actionError = new apogee.ActionError(msg,"AppException",null);
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