
visicomp.app.visiui.openworkspace = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.openworkspace.getOpenCallback = function(app) {
    return function() {
    
        var onOpen = function(workspaceData) {

            //this will show the asynchronous result
            var actionCompletedCallback = function(actionResponse) {
                if(!actionResponse.getSuccess()) {
                    alert(actionResponse.getErrorMsg());
                }
            }

            //open workspace
            visicomp.app.visiui.openworkspace.openWorkspace(app,workspaceData,actionCompletedCallback);

            //we should show some sort of loading message or symbol

            return true;
        }
        
        visicomp.app.visiui.dialog.showOpenWorkspaceDialog(onOpen);
    }
}

//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
visicomp.app.visiui.openworkspace.openWorkspace = function(app,workspaceText,actionCompletedCallback) {
    var actionResponse = new visicomp.core.ActionResponse();
    var name;
    var workspaceUIAdded;
    
    try {
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!    

		//make a blank workspace
        name = workspaceJson.workspace.name;
        
        var workspaceUI = new visicomp.app.visiui.WorkspaceUI();
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
            visicomp.app.visiui.openworkspace.loadWorkspace(workspaceUI,workspaceJson);
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
        var actionError = visicomp.core.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}

/** This method loads an existing workspace into an empty workspace UI. */
visicomp.app.visiui.openworkspace.loadWorkspace = function(workspaceUI,workspaceJson,actionResponse) {
    var workspaceDataJson = workspaceJson.workspace;
    var workspaceComponentsJson = workspaceJson.components;

    var workspace = new visicomp.core.Workspace(workspaceDataJson,actionResponse);
    
    workspaceUI.setWorkspace(workspace,workspaceComponentsJson);
}