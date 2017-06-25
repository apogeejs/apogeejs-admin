
apogeeapp.app.importworkspace = {};

//=====================================
// UI Entry Point
//=====================================

/** Call this withthe appropriate generator - folder or folder function, for the given import type. */
apogeeapp.app.importworkspace.getImportCallback = function(app,parentGenerator) {
    return function() {
    
        //make sure there is not an open workspace
        if(!app.getWorkspaceUI()) {
            alert("There must be an open workspace to import a workspace.");
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
                apogeeapp.app.importworkspace.openWorkspace(app,parentGenerator,workspaceData,workspaceHandle,actionCompletedCallback);
            }
        }    
        
        //use open file from open workspace
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
apogeeapp.app.importworkspace.openWorkspace = function(app,parentGenerator,workspaceText,workspaceHandle,actionCompletedCallback) {
    var actionResponse = new apogee.ActionResponse();
    var name;
    
    try {
        //make sure there is not an open workspace
        var workspaceUI = app.getWorkspaceUI();
        
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!    
    
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
        var newParentOptionsJson = {};
        newParentOptionsJson.name = workspaceJson.workspace.data.name;
        parentGenerator.appendWorkspaceChildren(newParentOptionsJson,workspaceJson.workspace.data.children);
        var newChildComponentsJson = {};
        newChildComponentsJson.children = workspaceJson.components;
		var workspaceImportDialogFunction = apogeeapp.app.addcomponent.getAddComponentCallback(app,parentGenerator,newParentOptionsJson,newChildComponentsJson);
        
        if(linksAdded) {
			workspaceUI.setLinks(jsLinks,cssLinks,workspaceImportDialogFunction);
		}
		else {
			//immediately load the workspace - no links to wait for
            workspaceImportDialogFunction();
		}
    }
    catch(error) {
        //figure out what to do here???
        
        var actionError = apogee.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}
//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.importworkspace.openWorkspaceFromUrl = function(app,url) {
    var actionCompletedCallback = function(actionResponse) {
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    };
    
    apogeeapp.app.importworkspace.openWorkspaceFromUrlImpl(app,url,actionCompletedCallback);
}

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.importworkspace.openWorkspaceFromUrlImpl = function(app,url,actionCompletedCallback) {
    var onDownload = function(workspaceText) {
        apogeeapp.app.importworkspace.openWorkspace(app,workspaceText,url,actionCompletedCallback);
    }
    
    var onFailure = function(msg) {
        var actionError = new apogee.ActionError(msg,"AppException",null);
        var actionResponse = new apogee.ActionResponse();
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }   
    apogeeapp.app.importworkspace.doRequest(url,onDownload,onFailure);   
}

/**
 * This is an http request for the worksheet data
 */
apogeeapp.app.importworkspace.doRequest= function(url,onDownload,onFailure) {
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
