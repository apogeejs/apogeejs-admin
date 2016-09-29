/** This class manages the user interface for a workspace object. */
visicomp.app.visiui.WorkspaceUI = function() {

    this.workspace = null;
	
    //properties
	this.app = null;
    this.tab = null;
    this.componentMap = {};
    this.activeFolderName = null;
   
    this.jsLinkArray = [];
    this.cssLinkArray = [];
}

/** This sets the application. It must be done before the workspace is set. */
visicomp.app.visiui.WorkspaceUI.prototype.setApp = function(app,tab) {
    this.app = app;
    this.tab = tab;
}

/** This gets the application instance. */
visicomp.app.visiui.WorkspaceUI.prototype.getApp = function() {
    return this.app;
}

 /** This method sets the workspace. The argument componentsJson should be included
  * if the workspace is not empty, such as when opening a existing workspace. It
  * contains the data for the component associated with each workspace member. For 
  * a new empty workspace the componentsJson should be omitted. */
visicomp.app.visiui.WorkspaceUI.prototype.setWorkspace = function(workspace, componentsJson) {   
    this.workspace = workspace; 
    
    //set up the root folder
    var rootFolder = this.workspace.getRootFolder();
    this.registerMember(rootFolder,null);
    this.addComponentContainer(rootFolder,this.tab);
  
    //load components from json if present
    if(componentsJson) {
        this.loadFolderComponentContentFromJson(rootFolder,componentsJson);
    }
    
    //listeners
    var instance = this;
    
    //add a member updated listener
    var memberUpdatedCallback = function(memberObject) {
        instance.memberUpdated(memberObject);
    }
    this.workspace.addListener(visicomp.core.updatemember.MEMBER_UPDATED_EVENT, memberUpdatedCallback);
	
	//add child deleted listener
    var childDeletedListener = function(fullName) {
        instance.childDeleted(fullName);
    }
    this.workspace.addListener(visicomp.core.deletemember.MEMBER_DELETED_EVENT, childDeletedListener);
    
    //add context menu to create childrent
    var contentElement = this.tab.getContainerElement();
    var app = this.getApp();
    app.setFolderContextMenu(contentElement,rootFolder);
    
}

/** This method gets the workspace object. */
visicomp.app.visiui.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method gets the component associated with a member object. */
visicomp.app.visiui.WorkspaceUI.prototype.getComponent = function(object) {
    var key = visicomp.app.visiui.WorkspaceUI.getObjectKey(object);
	var componentInfo = this.componentMap[key];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This returns the map of component objects. */
visicomp.app.visiui.WorkspaceUI.prototype.getFolderList = function() {
	var folderList = []; 
    for(var key in this.componentMap) {
		var componentInfo = this.componentMap[key];
		if(componentInfo.parentContainer) { 
			folderList.push(key);
		}
    }
    return folderList;
}

visicomp.app.visiui.WorkspaceUI.prototype.getParentContainerObject = function(object) {
    var parent = object.getParent();
    
    //get parent component info
    var parentKey = visicomp.app.visiui.WorkspaceUI.getObjectKey(parent);
    var parentComponentInfo = this.componentMap[parentKey];
    if(!parentComponentInfo.parentContainer) {
        throw visicomp.core.util.createError("Parent container not found!");
    }
    return parentComponentInfo.parentContainer;
}

/** This method registers a member data object and its optional component object.
 * for each folder, and only folders at this point, the mehod addComponentContainer
 * should also be called to set the container for the children of this folder. */
visicomp.app.visiui.WorkspaceUI.prototype.registerMember = function(object,component) {
    
    //make sure this is for us
    if(object.getWorkspace() !== this.workspace) {
        throw visicomp.core.util.createError("Component registered in wrong workspace: " + object.getFullName());
    }
    
    //store the ui object
	var key = visicomp.app.visiui.WorkspaceUI.getObjectKey(object);
	
	if(this.componentMap[key]) {
		//already exists! (we need to catch this earlier if we want it to not be fatal. But we should catch it here too.)
        throw visicomp.core.util.createError("There is already a component with the given name.",true);
	}
	
    var componentInfo = {};
    componentInfo.object = object;
	componentInfo.component = component;
	
    this.componentMap[key] = componentInfo;
    
}

/** This method sets the parent for the given component. */
visicomp.app.visiui.WorkspaceUI.prototype.addComponentContainer = function(object,parentContainer) {
    
    //store the ui object
	var key = visicomp.app.visiui.WorkspaceUI.getObjectKey(object);
	
    var componentInfo = this.componentMap[key];
    if(!componentInfo) {
		alert("Unknown error - component info not found: " + key);
		return;
	}
	componentInfo.parentContainer = parentContainer;
}
	

/** This method responds to a member updated. */
visicomp.app.visiui.WorkspaceUI.prototype.memberUpdated = function(memberObject) {
    //store the ui object
	var key = memberObject.getFullName();
	
	var componentInfo = this.componentMap[key];
	if((componentInfo)&&(componentInfo.component)) {
        componentInfo.component.memberUpdated();
    }
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.childDeleted = function(fullName) {
	
	//store the ui object
	var key = fullName;
	
	var componentInfo = this.componentMap[key];
	delete this.componentMap[key];

	if((componentInfo)&&(componentInfo.component)) {
        //do any needed cleanup
        componentInfo.component.onDelete();
	}
}

visicomp.app.visiui.WorkspaceUI.getObjectKey = function(object) {
	return object.getFullName();
}

visicomp.app.visiui.WorkspaceUI.prototype.getObjectByKey = function(key) {
    var componentInfo = this.componentMap[key];
    if(componentInfo) {
        return componentInfo.object;
    }
    else {
        return null;
    }
}

visicomp.app.visiui.WorkspaceUI.prototype.getComponentByKey = function(key) {
    var componentInfo = this.componentMap[key];
    if(componentInfo) {
        return componentInfo.component;
    }
    else {
        return null;
    }
}

/** This method gets the workspace object. */
visicomp.app.visiui.WorkspaceUI.prototype.close = function() {
    //delete all the components - to make sure the are cleaned up
    for(var key in this.componentMap) {
        var componentInfo = this.componentMap[key];
        if((componentInfo)&&(componentInfo.component)) {
            componentInfo.component.onDelete();
        }
    }
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
    json.components = this.getFolderComponentContentJson(rootFolder);
    
    return json;
}

visicomp.app.visiui.WorkspaceUI.prototype.getFolderComponentContentJson = function(folder) {
    var json = {};
    var childMap = folder.getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
        
		//get the object map for the workspace
		var childComponent = this.getComponent(child);
		
		//get the component for this child
		var name = child.getName();
		json[name] = childComponent.toJson();
	}
    return json;
}

visicomp.app.visiui.WorkspaceUI.prototype.loadFolderComponentContentFromJson = function(folder,json) {
	for(var key in json) {
		var childJson = json[key];
		var childMember = folder.lookupChild(key);	
		this.loadComponentFromJson(childMember,childJson);
	}
}

visicomp.app.visiui.WorkspaceUI.prototype.loadComponentFromJson = function(member,json) {
    var componentType = json.type;
    var generator = this.app.getComponentGenerator(componentType);
	if(generator) {
        generator.createComponentFromJson(this,member,json);
    }
    else {
        throw visicomp.core.util.createError("Component type not found: " + componentType);
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
	this.app.updateWorkspaceLinks(name,addList,removeList,onLinksLoaded);;
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
    