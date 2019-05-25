
apogeeapp.app.importworkspace = {};

//=====================================
// UI Entry Point
//=====================================

/** Call this withthe appropriate generator - folder or folder function, for the given import type. */
 apogeeapp.app.importworkspace.importWorkspace = function(app,fileAccessObject,componentGenerator) {

    //make sure there is not an open workspace
    if(!app.getWorkspaceUI()) {
        alert("There must be an open workspace to import a workspace.");
        return;
    }    

    var onOpen = function(err,app,workspaceData,fileMetadata) {
        if(err) {
            var actionResponse = new apogee.ActionResponse();
            var actionError = apogee.ActionError.processException(err,apogee.ActionError.ERROR_TYPE_USER,false);
            actionResponse.addError(actionError);
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
        }
        else {
            //open workspace
            apogeeapp.app.importworkspace.openWorkspace(app,componentGenerator,workspaceData,fileMetadata);
        }
    }

    //use open file from open workspace
    fileAccessObject.openFile(app,onOpen);
}

//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
apogeeapp.app.importworkspace.openWorkspace = function(app,componentGenerator,workspaceText,fileMetadata) {
    var actionResponse = new apogee.ActionResponse();
    var name;
    
    try {
        //make sure there is not an open workspace
        var workspaceUI = app.getWorkspaceUI();
        
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!  

        var referencesJson = workspaceJson.references;
        var loadReferencesPromise = workspaceUI.getLoadReferencesPromise(referencesJson);
    	
		//if we have to load links wait for them to load
        //for initial properties take the workspace name as the object name
        var initialProperties = {};
        initialProperties.name = workspaceJson.workspace.data.name;

        var serializedMemberJson = apogeeapp.app.importworkspace.getMemberJsonFromWorkspaceJson(workspaceJson,componentGenerator);
        var serializedComponentsJson = apogeeapp.app.importworkspace.getComponentJsonFromWorkspaceJson(workspaceJson,componentGenerator);
        
		var workspaceImportDialogFunction = () => apogeeapp.app.addcomponent.addComponent(app,componentGenerator,initialProperties,serializedMemberJson,serializedComponentsJson);
        
        var linkLoadError = function(errorMsg) {
            alert("Error loading links: " + errorMsg);
        }
        
        var workspaceImportError2 = function(errorMsg) {
            var actionError = new apogee.ActionError(errorMsg,apogee.ActionError.ERROR_TYPE_USER,false);
            actionResponse.addError(actionError);
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
        }
        
        //load links then import the workspace. On a link load error, continue with importing the workspace
        //we should not have a workspace import error from the workspaceImportDialogFunction since it should 
        //capture its own errors 
        loadReferencesPromise.catch(linkLoadError).then(workspaceImportDialogFunction).catch(workspaceImportError2);
    }
    catch(error) {
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
        apogeeapp.app.errorHandling.handleActionError(actionResponse);
    }
    
    return true;
}
//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.importworkspace.openWorkspaceFromUrl = function(app,url) {
    var actionCompletedCallback = function(actionResponse) {
        if(!actionResponse.getSuccess()) {
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
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
        var actionError = new apogee.ActionError(msg,apogee.ActionError.ERROR_TYPE_APP,null);
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

/** This reads the proper member json from the imported workspace json. */
apogeeapp.app.importworkspace.getMemberJsonFromWorkspaceJson = function(workspaceJson,componentGenerator) {
    var memberFolderJson = workspaceJson.workspace.data;
    
    if(componentGenerator.uniqueName == "apogeeapp.app.FolderFunctionComponent") {
        //I should probably do this conversion in the folder function code, so it is easier to maintain
        var memberFolderFunctionJson = componentGenerator.DEFAULT_MEMBER_JSON;
        var internalFolderJson = apogee.util.jsonCopy(memberFolderJson);
        internalFolderJson.name = "root";
        memberFolderFunctionJson.internalFolder = internalFolderJson;
        return memberFolderFunctionJson;
    }
    else if(componentGenerator.uniqueName == "apogeeapp.app.FolderComponent") {
        return memberFolderJson;
    }
    else {
        throw new Error("Unknown target type: " + componentGenerator.uniqueName);
    }

}
        
/** This reads the proper component json from the imported workspace json. */
apogeeapp.app.importworkspace.getComponentJsonFromWorkspaceJson = function(workspaceJson,componentGenerator) {
    var componentFolderJson = workspaceJson.components;
    
    if(componentGenerator.uniqueName == "apogeeapp.app.FolderFunctionComponent") {
        //I should probably do this conversion in the folder function code, so it is easier to maintain
        var componentFolderFunctionJson = {
            type: componentGenerator.uniqueName,
            children: componentFolderJson.children
        }
        return componentFolderFunctionJson;
    }
    else if(componentGenerator.uniqueName == "apogeeapp.app.FolderComponent") {
        return componentFolderJson;
    }
    else {
        throw new Error("Unknown target type: " + componentGenerator.uniqueName);
    }
}
        
        