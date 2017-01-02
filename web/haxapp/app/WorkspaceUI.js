/** This class manages the user interface for a workspace object. */
haxapp.app.WorkspaceUI = function() {

    this.workspace = null;
	
    //properties
	this.app = null;
    this.tab = null;
    this.componentMap = {};
    this.activeFolderName = null;
   
    this.jsLinkArray = [];
    this.cssLinkArray = [];
}

haxapp.app.WorkspaceUI.MAIN_WORKSPACE_NAME = "main workspace";

/** This sets the application. It must be done before the workspace is set. */
haxapp.app.WorkspaceUI.prototype.setApp = function(app,tab,treePane) {
    this.app = app;
    this.tab = tab;
    this.tree = new haxapp.ui.treecontrol.TreeControl();
    treePane.appendChild(this.tree.getElement());
}

/** This gets the application instance. */
haxapp.app.WorkspaceUI.prototype.getApp = function() {
    return this.app;
}

 /** This method sets the workspace. The argument componentsJson should be included
  * if the workspace is not empty, such as when opening a existing workspace. It
  * contains the data for the component associated with each workspace member. For 
  * a new empty workspace the componentsJson should be omitted. */
haxapp.app.WorkspaceUI.prototype.setWorkspace = function(workspace, componentsJson) {   
    this.workspace = workspace; 
    
    //set up the root folder
    var rootFolder = this.workspace.getRoot();
    var rootFolderComponent = new haxapp.app.FolderComponent(this,rootFolder);
    if(componentsJson) {
        this.loadFolderComponentContentFromJson(rootFolder,componentsJson);
    }
    
    //TREE_ENTRY - add the root tree entyr to the panel
    this.tree.setRootEntry(rootFolderComponent.getTreeEntry().getElement());
    
    //listeners
    var instance = this;
    
    //add a member updated listener
    var memberUpdatedCallback = function(member) {
        instance.memberUpdated(member);
    }
    this.workspace.addListener(hax.updatemember.MEMBER_UPDATED_EVENT, memberUpdatedCallback);
	
	//add child deleted listener
    var childDeletedListener = function(member) {
        instance.childDeleted(member);
    }
    this.workspace.addListener(hax.deletemember.MEMBER_DELETED_EVENT, childDeletedListener);
}

/** This method gets the workspace object. */
haxapp.app.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method gets the component associated with a member object. */
haxapp.app.WorkspaceUI.prototype.getComponent = function(object) {
	var componentInfo = this.componentMap[object.getId()];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This returns the map of component objects. */
haxapp.app.WorkspaceUI.prototype.getFolders = function() {
    var folders = {}
    for(var key in this.componentMap) {
		var componentInfo = this.componentMap[key];
        var member = componentInfo.object;
        if(member.isParent) { 
            folders[member.getFullName()] = member;
        }
    }
    return folders;
}

haxapp.app.WorkspaceUI.prototype.getParentContainerObject = function(object) {
    var parent = object.getParent();
    if(parent) {
        var parentComponent = this.getComponent(parent);
        //I SHOULD DO A BETTER CHECK TO MAKE SURE THIS IS A PARENT COMPONENT
        if(!parentComponent.getContainerElement) {
            throw hax.base.createError("Parent container not found!");
        }
        return parentComponent;
    }
    else {
        //root of workspace! - TEMPORARY
        return this.tab;
    }
}

/** This method registers a member data object and its associated component object.
 * If the member is not the main member assoicated with component but instead an included
 * member, the main componentMember should be passed in also. Otherwise it should be left 
 * undefined. */
haxapp.app.WorkspaceUI.prototype.registerMember = function(member,component,mainComponentMember) {
    
    //make sure this is for us
    if(member.getWorkspace() !== this.workspace) {
        throw hax.base.createError("Component registered in wrong workspace: " + member.getFullName());
    }
    
    //store the ui object
	var memberId = member.getId();
	
	if(this.componentMap[memberId]) {
		//already exists! (we need to catch this earlier if we want it to not be fatal. But we should catch it here too.)
        throw hax.base.createError("There is already a member with the given ID.",true);
	}
	
    var componentInfo = {};
    componentInfo.object = member;
	componentInfo.component = component;
    if(mainComponentMember) componentInfo.componentMember = mainComponentMember;
	
    this.componentMap[memberId] = componentInfo;
    
}

/** This method sets the parent for the given component. */
haxapp.app.WorkspaceUI.prototype.addComponentContainer = function(object,parentContainer) {
    
    //store the ui object
	
    var componentInfo = this.componentMap[object.getId()];
    if(!componentInfo) {
		alert("Unknown error - component info not found: " + key);
		return;
	}
	componentInfo.parentContainer = parentContainer;
}
	

/** This method responds to a member updated. */
haxapp.app.WorkspaceUI.prototype.memberUpdated = function(memberObject) {
    //store the ui object
	var key = memberObject.getId();
    
	var componentInfo = this.componentMap[key];
	if((componentInfo)&&(componentInfo.component)) {
        componentInfo.component.memberUpdated();
    }
}

/** This method responds to a "new" menu event. */
haxapp.app.WorkspaceUI.prototype.childDeleted = function(memberObject) {
	
	//store the ui object
	var memberId = memberObject.getId();
	
	var componentInfo = this.componentMap[memberId];
	delete this.componentMap[memberId];

	if((componentInfo)&&(componentInfo.component)) {
        //do any needed cleanup
        componentInfo.component.onDelete();
	}
}

/** This method gets the workspace object. */
haxapp.app.WorkspaceUI.prototype.close = function() {
    //delete all the components - to make sure the are cleaned up
    for(var key in this.componentMap) {
        var componentInfo = this.componentMap[key];
        if((componentInfo)&&(componentInfo.component)&&(!componentInfo.componentMember)) {
            componentInfo.component.onDelete();
        }
    }
    
    //TREE_ENTRY - remove tree entry
    this.tree.clearRootEntry();
    
    //remove links
    this.setLinks([],[]);
}

//====================================
// open and save methods
//====================================

haxapp.app.WorkspaceUI.prototype.toJson = function() {
    var json = {};
    json.fileType = "hax workspace";
    
    json.jsLinks = this.jsLinkArray;
    json.cssLinks = this.cssLinkArray;
    
    json.workspace = this.workspace.toJson();
    
    var rootFolder = this.workspace.getRoot();
    json.components = this.getFolderComponentContentJson(rootFolder);
    
    return json;
}

haxapp.app.WorkspaceUI.prototype.getFolderComponentContentJson = function(folder) {
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

haxapp.app.WorkspaceUI.prototype.loadFolderComponentContentFromJson = function(folder,json) {
	for(var key in json) {
		var childJson = json[key];
		var childMember = folder.lookupChild(key);	
		this.loadComponentFromJson(childMember,childJson);
	}
}

haxapp.app.WorkspaceUI.prototype.loadComponentFromJson = function(member,json) {
    var componentType = json.type;
    var generator = this.app.getComponentGenerator(componentType);
	if(generator) {
        generator.createComponentFromJson(this,member,json);
    }
    else {
        throw hax.base.createError("Component type not found: " + componentType);
    }
}


//========================================
// Links
//========================================

haxapp.app.WorkspaceUI.prototype.getJsLinks = function() {
	return this.jsLinkArray;
}

haxapp.app.WorkspaceUI.prototype.setLinks = function(newJsLinkArray,newCssLinkArray,onLinksLoaded) {
    //update the page links
    var oldJsLinkArray = this.jsLinkArray;
	var oldCssLinkArray = this.cssLinkArray;
	var addList = [];
	var removeList = [];
	
    this.createLinkAddRemoveList(newJsLinkArray,oldJsLinkArray,"js",addList,removeList);
	this.createLinkAddRemoveList(newCssLinkArray,oldCssLinkArray,"css",addList,removeList);
	
    this.jsLinkArray = newJsLinkArray;
	this.cssLinkArray = newCssLinkArray;
	this.app.updateWorkspaceLinks(haxapp.app.WorkspaceUI.MAIN_WORKSPACE_NAME,addList,removeList,onLinksLoaded);
}

haxapp.app.WorkspaceUI.prototype.getCssLinks = function() {
	return this.cssLinkArray;
}

/** This method determins which links are new, which are old and which are removed.  
 * @private */
haxapp.app.WorkspaceUI.prototype.createLinkAddRemoveList = function(linkArray,oldLinkArray,type,addList,removeList) { 
    
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
    