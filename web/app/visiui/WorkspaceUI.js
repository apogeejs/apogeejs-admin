/** This class manages the user interface for a workspace object. */
visicomp.app.visiui.WorkspaceUI = function(workspace,tab) {
    //properties
    this.tab = tab;
    this.controlMap = {};
    this.activeFolderName = null;
    this.workspace = workspace;
    
/////////////////////////////////////////////
var rootFolder = workspace.getRootFolder();
var controlInfo = {};
	controlInfo.control = rootFolder;
    //no ui object!!!
	
    this.controlMap[this.getObjectKey(rootFolder)] = controlInfo;

/////////////////////////////////////////////
	
    //listeners
    var instance = this;
	
	//add folder created listener
    var childDeletedListener = function(objectFullName) {
        instance.childDeleted(objectFullName);
    }
    this.workspace.addListener(visicomp.core.deletechild.CHILD_DELETED_EVENT, childDeletedListener);
}

visicomp.app.visiui.WorkspaceUI.newTableX = 100;
visicomp.app.visiui.WorkspaceUI.newTableY = 50;

visicomp.app.visiui.WorkspaceUI.newTableDeltaX = 50;
visicomp.app.visiui.WorkspaceUI.newTableDeltaY = 50;

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.getChildUIObject = function(childObject) {
    var key = this.getObjectKey(childObject);
	var objectInfo = this.controlMap[key][key];
	return objectInfo.objectUI;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.addControl = function(control) {
    //make sure this is for us
    if(control.getWorkspace() !== this.workspace) return;
	
    var object = control.getObject();
	var parent = object.getParent();
    var controlInfo = this.controlMap[this.getObjectKey(parent)];
	var parentContainer;
	if(controlInfo.control) {
        //the parent control should have a content element (and should be a folder)
        //maybe we need to enforce this its the right tyep and/or add a parent component instead)
		parentContainer = controlInfo.control.getContentElement();
	}
	else {
        //we will assume if there is no control is is the root
		parentContainer = this.tab;
	}
	
	//create the ui object
	var controlFrame = new visicomp.app.visiui.ChildUI(control,parentContainer,object.getName());
    control.setFrame(controlFrame);
	
	//store the ui object
	var key = this.getObjectKey(object);
	
	if(this.controlMap[key]) {
		alert("Unknown error - there is already an object with this object key: " + key);
		return;
	}
	
    controlInfo = {};
    controlInfo.object = object;
	controlInfo.control = control;
	
    this.controlMap[key] = controlInfo;
    
    //show the window
    var window = control.getWindow();
	if(window) {
		window.setPosition(visicomp.app.visiui.WorkspaceUI.newTableX,visicomp.app.visiui.WorkspaceUI.newTableY);
		visicomp.app.visiui.WorkspaceUI.newTableX += visicomp.app.visiui.WorkspaceUI.newTableDeltaX;
		visicomp.app.visiui.WorkspaceUI.newTableY += visicomp.app.visiui.WorkspaceUI.newTableDeltaY;
		window.show();
	}
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.childDeleted = function(fullName) {

//we should verify the workspace!
	
	//store the ui object
	var key = fullName;
	
	var controlInfo = this.controlMap[key];
	delete this.controlMap[key];

	if((controlInfo)&&(controlInfo.control)) {
		controlInfo.control.removeFromParent();	
	}
}

visicomp.app.visiui.WorkspaceUI.prototype.getObjectKey = function(object) {
//needs to be changed when we add worksheets
	return object.getFullName();
}

visicomp.app.visiui.WorkspaceUI.prototype.toJson = function() {
    var json = {};
    json.name = this.workspace.getName();
    json.fileType = "visicomp workspace";
    
//links - this is part of app, not workspace, but for now we sav it with workspace!!!
    var jsLinks = app.getJsLinks();
    if((jsLinks)&&(jsLinks.length > 0)) {
        json.jsLinks = jsLinks;
    }
    var cssLinks = app.getCssLinks();
    if((jsLinks)&&(jsLinks.length > 0)) {
        json.cssLinks = cssLinks;
    }
    
    //children
    json.data = {};
	for(var key in this.controlMap) {
		var controlInfo = this.controlMap[key];
        var control = controlInfo.control;
        if(control) {
            json.data[key] = control.toJson();
        }
	}
    
    return json;
}


/** This is used for saving the workspace. */
visicomp.app.visiui.WorkspaceUI.workspaceFromJson = function(app, json) {
    var name = json.name;
    var fileType = json.fileType;
	if((fileType !== "visicomp workspace")||(!name)) {
		alert("Error openging file");
		return null;
	}
    
    //add links
// we really need to wait for them to load
    if(json.jsLinks) {
        app.setJsLinks(json.jsLinks);
    }
    if(json.cssLinks) {
        app.setCssLinks(json.cssLinks);
    }
	
//we need to wait for all links to load!!!
    
	//create the workspace
    app.createWorkspace(name);
	var workspace = app.getWorkspace();
	
	//create children
	var parent = workspace.getRootFolder();
	var childMap = json.data;
	var updateDataList = [];
	for(var key in childMap) {
		var childJson = childMap[key];
        var type = childJson.type;
        var controlGenerator = app.getControlGenerator(type);
        if(!controlGenerator) {
            throw visicomp.core.util.createError("Control definition not found: " + type);
        }
        controlGenerator.createFromJson(app,parent,childJson,updateDataList)
	}
    
    //set the data on all the objects
    var result;
    if(updateDataList.length > 0) {
        result = visicomp.core.updatemember.updateObjects(updateDataList);
            
        if(!result.success) {
            return result;
        }
    }
    
//figure out a better return
	return result;
}

