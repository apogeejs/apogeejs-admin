/* 
 * Serialization and deserialization are put in the app because the UI is holding
 * special information to create and edit the objects, as opposed to the data that
 * is held by thee objects themselves. The child object allows for the object to store 
 * some unspecified data to be used by the editor.
 * 
 * IO am not 100% sure about this right now, but it is the most sesible thign for the time being.
 */

/** PLAN
 * - read all the objects
 * - create all named objects
 * - do a single multi object update event to set all data as needed 

/** This is used for saving the workspace. */
visicomp.app.visiui.workspaceToJson = function(workspace) {
    var json = {};
    json.name = workspace.getName();
    json.fileType = "visicomp workspace";
    json.data = {};
	var childMap = workspace.getRootFolder().getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
		json.data[key] = visicomp.app.visiui.childToJson(child);
	}
    return json;
}

/** This mehtod serializes a child object. 
 * @private */
visicomp.app.visiui.childToJson = function(child) {
    var json = {};
    json.name = child.getName();
    json.type = child.getType();
    
    var temp;
    
    switch(json.type) {
        case "folder":
            json.children = {};
            var childMap = child.getChildMap();
            for(var key in childMap) {
                var childChild = childMap[key];
                json.children[key] = visicomp.app.visiui.childToJson(childChild);
            }
            break;
            
        case "table":
            temp = child.getEditorInfo();
            if(temp) {
                json.formula = temp;
                json.supplementalCode = child.getSupplementalCode();
            }
            else {
                json.data = child.getData();
            }
            break;
            
        case "function":
            json.argParens = child.getArgParensString();
            json.functionBody = child.getEditorInfo();
			if((json.functionBody === null)||(json.functionBody === undefined)) json.functionBody = "";
            json.supplementalCode = child.getSupplementalCode();
            break;
            
        case "control":
            json.html = child.getHtml();
            json.onLoadBody = child.getOnLoadBody();
            json.supplementalCode = child.getSupplementalCode();
            json.css = child.getCss();
            json.jsLink = child.getJsLink();
            break;
            
    }
    
    return json;
}


/** This is used for saving the workspace. */
visicomp.app.visiui.workspaceFromJson = function(app, json) {
    var name = json.name;
    var fileType = json.fileType;
	if((fileType !== "visicomp workspace")||(!name)) {
		alert("Error openging file");
		return null;
	}
	
	//create the workspace
    app.createWorkspace(name);
	var workspace = app.getWorkspace();
    var workspaceUI = app.getWorkspaceUI();
	
	//create children
	var parent = workspace.getRootFolder();
	var childMap = json.data;
	var dataToUpdate = {};
    dataToUpdate.members = [];
    dataToUpdate.controls = [];
	for(var key in childMap) {
		var childJson = childMap[key];
		visicomp.app.visiui.childFromJson(workspaceUI, parent, childJson, dataToUpdate);
	}
    
    //set the data on all the objects
    var result;
    if(dataToUpdate.members.length > 0) {
        result = workspace.callHandler(
            visicomp.core.updatemember.UPDATE_MEMBERS_HANDLER,
            dataToUpdate.members);
            
        if(!result.success) {
            return result;
        }
    }
    
    for(var i = 0; i < dataToUpdate.controls.length; i++) {
        result = workspace.callHandler(
            visicomp.core.updatecontrol.UPDATE_CONTROL_HANDLER,
            dataToUpdate.controls[i]);
    }
    
	
//figure out a better return
	return result;
}

/** This mehtod serializes a child object. 
 * @private */
visicomp.app.visiui.childFromJson = function(workspaceUI,parent,childJson,dataToUpdate) {
    var name = childJson.name;
    var type = childJson.type;
	
	var childObject;
	var childUIObject;
	var childUpdateData;
    
	//create the object
    switch(type) {
        case "folder":
            workspaceUI.addFolder(parent,name,false);
            
            //add the contents of this folder
            childObject = parent.lookupChild(name);
            var grandchildrenJson = childJson.children;
            for(var key in grandchildrenJson) {
                var grandchildJson = grandchildrenJson[key];
                visicomp.app.visiui.childFromJson(workspaceUI, childObject, grandchildJson, childUpdateDataList);
            }
            break;
            
        case "table":
			workspaceUI.addTable(parent,name);

			//lookup the child and create the update event objecct for it
			childObject = parent.lookupChild(name);
			childUpdateData = visicomp.app.visiui.TableUI.getUpdateEventData(childObject,childJson.data,childJson.formula,childJson.supplementalCode);
			dataToUpdate.members.push(childUpdateData);
            break;
            
        case "function":
			var argParens = childJson.argParens;
			workspaceUI.addFunction(parent,name + argParens);
			
			//lookup the child and create the update event objecct for it
			childObject = parent.lookupChild(name);
			childUpdateData = visicomp.app.visiui.FunctionUI.getUpdateEventData(childObject,childJson.functionBody,childJson.supplementalCode);
			dataToUpdate.members.push(childUpdateData);
            break;
            
        case "control":
			workspaceUI.addControl(parent,name);
			
			//lookup the child and create the update event objecct for it
			childObject = parent.lookupChild(name);
			childUpdateData = visicomp.app.visiui.ControlUI.getUpdateEventData(childObject,childJson.html,
                childJson.onLoadBody,childJson.supplementalCode,childJson.css,childJson.jsLink);
			dataToUpdate.controls.push(childUpdateData);
            break;
            
    }
}

