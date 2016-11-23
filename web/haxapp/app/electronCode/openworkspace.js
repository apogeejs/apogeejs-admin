


haxapp.app.openworkspace = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.openworkspace.getOpenCallback = function(app) {
    return function() {
    
        var onOpen = function(err,workspaceData) {
            
            if(err) {
                
                alert("Error: " + err.message);
                return false;
            }
            else {
                var actionCompletedCallback = function(actionResponse) {
                    if(!actionResponse.getSuccess()) {
                        alert(actionResponse.getErrorMsg());
                    }
                };

                //open workspace
                haxapp.app.openworkspace.openWorkspace(app,workspaceData,actionCompletedCallback);

                //we should show some sort of loading message or symbol
                return true;
            }
        }
        
        //show file open dialog
        var electron = require('electron').remote;
        var dialog = electron.dialog;
        
		var fileList = dialog.showOpenDialog({properties: ['openFile']});
			
        if((fileList)&&(fileList.length > 0)) {
            var name = fileList[0];
            var fs = require('fs');
            fs.readFile(name,onOpen);
        }
    }
}



//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
haxapp.app.openworkspace.openWorkspace = function(app,workspaceText,actionCompletedCallback) {
    var actionResponse = new hax.ActionResponse();
    var name;
    var workspaceUIAdded;
    
    try {
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!    

		//make a blank workspace
        name = workspaceJson.workspace.name;
        
        var workspaceUI = new haxapp.app.WorkspaceUI();
        workspaceUIAdded = app.addWorkspaceUI(workspaceUI,name);
    
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
            haxapp.app.openworkspace.loadWorkspace(workspaceUI,workspaceJson);
            actionCompletedCallback(actionResponse);
        }
        
        if(linksAdded) {
			//set links and set the callback to complete loading the workspace
			workspaceUI.setLinks(jsLinks,cssLinks,doWorkspaceLoad,name);
		}
		else {
			//immediately load the workspace - no links to wait for
            doWorkspaceLoad();
		}
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.removeWorkspaceUI(name);
        }
        var actionError = hax.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}

/** This method loads an existing workspace into an empty workspace UI. */
haxapp.app.openworkspace.loadWorkspace = function(workspaceUI,workspaceJson,actionResponse) {
    var workspaceDataJson = workspaceJson.workspace;
    var workspaceComponentsJson = workspaceJson.components;

    var workspace = new hax.Workspace(workspaceDataJson,actionResponse);
    
    workspaceUI.setWorkspace(workspace,workspaceComponentsJson);
}

//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
haxapp.app.openworkspace.openWorkspaceFromUrl = function(app,url) {
    alert("Open workspace from URL not supported in electron");
}