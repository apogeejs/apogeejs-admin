/** This class manages the user interface for a workspace object. The argument
 * uiInitData is optional and should be included if the workspace is not empty. It
 * contains the information of how to create controls for the workspace data. */
visicomp.app.visiui.WorkspaceUI = function(app,tab,name) {
//note - this is not the correct event manager
var wrongEventManager = app;
    visicomp.app.visiui.ParentContainer.init.call(this,tab,wrongEventManager);
    
	this.workspace = new visicomp.core.Workspace(name);
	
    //properties
	this.app = app;
    this.tab = tab;
    this.controlMap = {};
    this.activeFolderName = null;
   
    this.jsLinkArray = [];
    this.cssLinkArray = [];
	
	//listeners
    var instance = this;
    
    //add a member updated listener
    var memberUpdatedCallback = function(memberObject) {
        instance.memberUpdated(memberObject);
    }
    this.workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, memberUpdatedCallback);
	
	//add child deleted listener
    var childDeletedListener = function(fullName) {
        instance.childDeleted(fullName);
    }
    this.workspace.addListener(visicomp.core.deletechild.CHILD_DELETED_EVENT, childDeletedListener);
	
	//set up the root folder
    var rootFolder = this.workspace.getRootFolder();
    this.registerMember(rootFolder,null);
    this.addControlContainer(rootFolder,this);
}
    

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.WorkspaceUI,visicomp.app.visiui.ParentContainer);

/** This method loads the data form this json into the workspace. */
visicomp.app.visiui.WorkspaceUI.prototype.loadFromJson = function(workspaceJson) {
    var workspaceDataJson = workspaceJson.workspace;
    var workspaceControlsJson = workspaceJson.controls;
	
	//I don't really like the way I do this, deleting the old folder, to allow for the new one
	var oldRootFolder = this.workspace.getRootFolder().getFullName();
	this.childDeleted(oldRootFolder);
	
	//load the workspace
    this.workspace.loadFromJson(workspaceDataJson);
    
	//reinitialize the root folder
    var rootFolder = this.workspace.getRootFolder();
    this.registerMember(rootFolder,null);
    this.addControlContainer(rootFolder,this)
    
    //oad contrtols from json if present
    if(workspaceControlsJson) {
        this.loadFolderControlContentFromJson(rootFolder,workspaceControlsJson);
    }
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method gets the control associated with a member object. */
visicomp.app.visiui.WorkspaceUI.prototype.getControl = function(object) {
    var key = this.getObjectKey(object);
	var controlInfo = this.controlMap[key];
	if(controlInfo) {
		return controlInfo.control;
	}
	else {
		return null;
	}
}

/** This returns the map of control objects. */
visicomp.app.visiui.WorkspaceUI.prototype.getControlMap = function() {
	return this.controlMap;
}

visicomp.app.visiui.WorkspaceUI.prototype.getParentContainerObject = function(object) {
    var parent = object.getParent();
    
    //get parent control info
    var parentKey = this.getObjectKey(parent);
    var parentControlInfo = this.controlMap[parentKey];
    if(!parentControlInfo.parentContainer) {
        throw visicomp.core.util.createError("Parent container not found!");
    }
    return parentControlInfo.parentContainer;
}

/** This method registers a member data object and its optional control object.
 * for each folder, and only folders at this point, the mehod addControlContainer
 * should also be called to set the container for the children of this folder. */
visicomp.app.visiui.WorkspaceUI.prototype.registerMember = function(object,control) {
    
    //make sure this is for us
    if(object.getWorkspace() !== this.workspace) {
        throw visicomp.core.util.createError("Control registered in wrong workspace: " + object.getFullName());
    }
    
    //store the ui object
	var key = this.getObjectKey(object);
	
	if(this.controlMap[key]) {
		alert("Unknown error - there is already an object with this object key: " + key);
		return;
	}
	
    var controlInfo = {};
    controlInfo.object = object;
	controlInfo.control = control;
	
    this.controlMap[key] = controlInfo;
    
}

/** This method registers a control. The parameter "parentContainer" is optional
 * and is only needed if the object is a parent container. */
visicomp.app.visiui.WorkspaceUI.prototype.addControlContainer = function(object,parentContainer) {
    
    //store the ui object
	var key = this.getObjectKey(object);
	
    var controlInfo = this.controlMap[key];
    if(!controlInfo) {
		alert("Unknown error - control info not found: " + key);
		return;
	}
	controlInfo.parentContainer = parentContainer;
}
	

/** This method responds to a member updated. */
visicomp.app.visiui.WorkspaceUI.prototype.memberUpdated = function(memberObject) {
    //store the ui object
	var key = memberObject.getFullName();
	
	var controlInfo = this.controlMap[key];
	if((controlInfo)&&(controlInfo.control)) {
        controlInfo.control.memberUpdated();
    }
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.childDeleted = function(fullName) {
	
	//store the ui object
	var key = fullName;
	
	var controlInfo = this.controlMap[key];
	delete this.controlMap[key];

	if((controlInfo)&&(controlInfo.control)) {
        //remove the UI element
        var controlWindow = controlInfo.control.getWindow();
        controlWindow.remove();
        
        //do any needed cleanup
        controlInfo.control.onDelete();
	}
}

visicomp.app.visiui.WorkspaceUI.prototype.getObjectKey = function(object) {
//needs to be changed when we add worksheets
	return object.getFullName();
}

//====================================
// open and save methods
//====================================

visicomp.app.visiui.WorkspaceUI.prototype.toJson = function() {
    var json = {};
    json.name = this.workspace.getName();
    json.fileType = "visicomp workspace";
    
    json.jsLinks = this.jsLinkArray;
    json.cssLinks = this.cssLinkArray;
    
    json.workspace = this.workspace.toJson();
    
    var rootFolder = this.workspace.getRootFolder();
    json.controls = this.getFolderControlContentJson(rootFolder);
    
    return json;
}

visicomp.app.visiui.WorkspaceUI.prototype.getFolderControlContentJson = function(folder) {
    var json = {};
    var childMap = folder.getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
        
		//get the object map for the workspace
		var childControl = this.getControl(child);
		
		//get the control for this child
		var name = child.getName();
		json[name] = childControl.toJson();
	}
    return json;
}

 /** This method responds to a "new" menu event. 
  * @private */
visicomp.app.visiui.WorkspaceUI.prototype.setWorkspace = function(workspace,workspaceControlsJson) {   
    
    this.workspace = workspace;
	
    
    
    
    
}

visicomp.app.visiui.WorkspaceUI.prototype.loadFolderControlContentFromJson = function(folder,json) {
	for(var key in json) {
		var childJson = json[key];
		var childMember = folder.lookupChild(key);	
		this.loadControlFromJson(childMember,childJson);
	}
}

visicomp.app.visiui.WorkspaceUI.prototype.loadControlFromJson = function(member,json) {
    var controlType = json.type;
    var generator = this.app.getControlGenerator(controlType);
	if(generator) {
        generator.createControlFromJson(this,member,json);
    }
    else {
        throw visicomp.core.util.createError("Control type not found: " + controlType);
    }
}


//========================================
// Links
//========================================

visicomp.app.visiui.WorkspaceUI.prototype.getJsLinks = function() {
	return this.jsLinkArray;
}
//GET RUID OF NAME ARG!!!
visicomp.app.visiui.WorkspaceUI.prototype.setLinks = function(newJsLinkArray,newCssLinkArray,onLinksLoaded,name) {
    //update the page links
    var oldJsLinkArray = this.jsLinkArray;
	var oldCssLinkArray = this.cssLinkArray;
	var addList = [];
	var removeList = [];
	
    this.createLinkAddRemoveList(newJsLinkArray,oldJsLinkArray,"js",addList,removeList);
	this.createLinkAddRemoveList(newCssLinkArray,oldCssLinkArray,"css",addList,removeList);
	
    this.jsLinkArray = newJsLinkArray;
	this.cssLinkArray = newCssLinkArray;
	this.app.updateWorkspaceLinks(/*this.workspace.getName()*/name,addList,removeList,onLinksLoaded);;
}

visicomp.app.visiui.WorkspaceUI.prototype.getCssLinks = function() {
	return this.cssLinkArray;
}

/** This method determins which links are new, which are old and which are removed.  
 * @private */
visicomp.app.visiui.WorkspaceUI.prototype.createLinkAddRemoveList = function(linkArray,oldLinkArray,type,addList,removeList) { 
    
    var newLinks = {};
    var i;
    var link;
    
    //add the new links
    for(i = 0; i < linkArray.length; i++) {
        link = linkArray[i];
        newLinks[link] = true;
    }
    
    //fiure out which are new and which are outdated
    for(i = 0; i < oldLinkArray.length; i++) {
        link = oldLinkArray[i];
        if(!newLinks[link]) {
			//this link has been removed
            removeList.push({"link":link,"type":type});
        }
		else {
			//flag that this does not need to be added
			newLinks[link] = false;
		}
    }
	
	//put the new links to the add list
	for(link in newLinks) {
		if(newLinks[link]) {
			addList.push({"link":link,"type":type});
		}
	}
}
    