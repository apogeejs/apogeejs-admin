/** This class manages the user interface for a workspace object. */
apogeeapp.app.WorkspaceUI = function() {

    this.workspace = null;
	
    //properties
	this.app = null;
    this.tabFrame = null;
    this.tree = null;
    this.componentMap = {};
    this.activeFolderName = null;
   
    this.jsLinkArray = [];
    this.cssLinkArray = [];
    
    this.workspaceTreeEntry = null;
}

apogeeapp.app.WorkspaceUI.MAIN_WORKSPACE_NAME = "main workspace";

/** This sets the application. It must be done before the workspace is set. */
apogeeapp.app.WorkspaceUI.prototype.setApp = function(app,tabFrame,treePane) {
    this.app = app;
    this.tabFrame = tabFrame;
    this.tree = new apogeeapp.ui.treecontrol.TreeControl();
    apogeeapp.ui.removeAllChildren(treePane);
    treePane.appendChild(this.tree.getElement());
}

/** This gets the application instance. */
apogeeapp.app.WorkspaceUI.prototype.getApp = function() {
    return this.app;
}

 /** This method sets the workspace. The argument componentsJson should be included
  * if the workspace is not empty, such as when opening a existing workspace. It
  * contains the data for the component associated with each workspace member. For 
  * a new empty workspace the componentsJson should be omitted. */
apogeeapp.app.WorkspaceUI.prototype.setWorkspace = function(workspace, componentsJson) {   
    this.workspace = workspace; 
    
    //set up the root folder
    var rootFolder = this.workspace.getRoot();
    var rootFolderComponent = new apogeeapp.app.FolderComponent(this,rootFolder);
    if(componentsJson) {
        this.loadFolderComponentContentFromJson(rootFolder,componentsJson);
    }
    
    //add the root tree entyr to the panel
    this.createWorkspaceTreeEntry();
    
    var rootFolderTreeEntry = rootFolderComponent.getTreeEntry();
    this.workspaceTreeEntry.addChild(rootFolder.getId(),rootFolderTreeEntry);
    //Set the root entry as expanded. Others parents will be default (collapsed)
    this.workspaceTreeEntry.setState(apogeeapp.ui.treecontrol.EXPANDED);
    
    //listeners
    var instance = this;
    
    //add a member updated listener
    var memberUpdatedCallback = function(member) {
        instance.memberUpdated(member);
    }
    this.workspace.addListener(apogee.updatemember.MEMBER_UPDATED_EVENT, memberUpdatedCallback);
	
	//add child deleted listener
    var childDeletedListener = function(member) {
        instance.childDeleted(member);
    }
    this.workspace.addListener(apogee.deletemember.MEMBER_DELETED_EVENT, childDeletedListener);
}

/** This method gets the workspace object. */
apogeeapp.app.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method gets the component associated with a member object. */
apogeeapp.app.WorkspaceUI.prototype.getComponent = function(object) {
	var componentInfo = this.componentMap[object.getId()];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This method gets the component associated with a member object. */
apogeeapp.app.WorkspaceUI.prototype.getComponentById = function(objectId) {
	var componentInfo = this.componentMap[objectId];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This returns the map of component objects. */
apogeeapp.app.WorkspaceUI.prototype.getFolders = function() {
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

/** This method registers a member data object and its associated component object.
 * If the member is not the main member assoicated with component but instead an included
 * member, the main componentMember should be passed in also. Otherwise it should be left 
 * undefined. */
apogeeapp.app.WorkspaceUI.prototype.registerMember = function(member,component,mainComponentMember) {
    
    //make sure this is for us
    if(member.getWorkspace() !== this.workspace) {
        throw apogee.base.createError("Component registered in wrong workspace: " + member.getFullName());
    }
    
    //store the ui object
	var memberId = member.getId();
	
	if(this.componentMap[memberId]) {
		//already exists! (we need to catch this earlier if we want it to not be fatal. But we should catch it here too.)
        throw apogee.base.createError("There is already a member with the given ID.",true);
	}
	
    var componentInfo = {};
    componentInfo.object = member;
	componentInfo.component = component;
    if(mainComponentMember) componentInfo.componentMember = mainComponentMember;
	
    this.componentMap[memberId] = componentInfo;
    
}
	

/** This method responds to a member updated. */
apogeeapp.app.WorkspaceUI.prototype.memberUpdated = function(memberObject) {
    //store the ui object
	var key = memberObject.getId();
    
	var componentInfo = this.componentMap[key];
	if((componentInfo)&&(componentInfo.component)) {
        componentInfo.component.memberUpdated();
    }
}

/** This method responds to a "new" menu event. */
apogeeapp.app.WorkspaceUI.prototype.childDeleted = function(memberObject) {
	
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
apogeeapp.app.WorkspaceUI.prototype.close = function() {
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

apogeeapp.app.WorkspaceUI.prototype.setActiveTab = function(id) {
    this.tabFrame.setActiveTab(id);
}

apogeeapp.app.WorkspaceUI.prototype.requestTab = function(id,makeActive) {
    var tab = this.tabFrame.addTab(id);
    if(makeActive) {
        this.tabFrame.setActiveTab(id);
    }
    return tab;
}

apogeeapp.app.WorkspaceUI.prototype.createWorkspaceTreeEntry = function() {
    
    //get this from somewhere better
    var iconSrc = apogeeapp.ui.getResourcePath("/genericIcon.png");
   
    var dblClickCallback = null;
    var contextMenuCallback = null;
    this.workspaceTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry("Workspace",iconSrc,dblClickCallback,contextMenuCallback,true);
    this.tree.setRootEntry(this.workspaceTreeEntry);
}
//====================================
// open and save methods
//====================================

/** This saves the workspace. It the optionalSavedRootFolder is passed in,
 * it will save a workspace with that as the root folder. */
apogeeapp.app.WorkspaceUI.prototype.toJson = function(optionalSavedRootFolder) {
    var json = {};
    json.fileType = "apogee workspace";
    
    json.jsLinks = this.jsLinkArray;
    json.cssLinks = this.cssLinkArray;
    
    json.workspace = this.workspace.toJson(optionalSavedRootFolder);
    
    var rootFolder;
    if(optionalSavedRootFolder) {
        rootFolder = optionalSavedRootFolder;
    }
    else {
        rootFolder = this.workspace.getRoot();
    }
    
    json.components = this.getFolderComponentContentJson(rootFolder);
    
    return json;
}

apogeeapp.app.WorkspaceUI.prototype.getFolderComponentContentJson = function(folder) {
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

apogeeapp.app.WorkspaceUI.prototype.loadFolderComponentContentFromJson = function(folder,json) {
	for(var key in json) {
		var childJson = json[key];
		var childMember = folder.lookupChild(key);	
		this.loadComponentFromJson(childMember,childJson);
	}
}

apogeeapp.app.WorkspaceUI.prototype.loadComponentFromJson = function(member,json) {
    var componentType = json.type;
    var generator = this.app.getComponentGenerator(componentType);
	if(generator) {
        generator.createComponentFromJson(this,member,json);
    }
    else {
        throw apogee.base.createError("Component type not found: " + componentType);
    }
}


//========================================
// Links
//========================================

apogeeapp.app.WorkspaceUI.prototype.getJsLinks = function() {
	return this.jsLinkArray;
}

apogeeapp.app.WorkspaceUI.prototype.setLinks = function(newJsLinkArray,newCssLinkArray,onLinksLoaded) {
    //update the page links
    var oldJsLinkArray = this.jsLinkArray;
	var oldCssLinkArray = this.cssLinkArray;
	var addList = [];
	var removeList = [];
	
    this.createLinkAddRemoveList(newJsLinkArray,oldJsLinkArray,"js",addList,removeList);
	this.createLinkAddRemoveList(newCssLinkArray,oldCssLinkArray,"css",addList,removeList);
	
    this.jsLinkArray = newJsLinkArray;
	this.cssLinkArray = newCssLinkArray;
	this.app.updateWorkspaceLinks(apogeeapp.app.WorkspaceUI.MAIN_WORKSPACE_NAME,addList,removeList,onLinksLoaded);
}

apogeeapp.app.WorkspaceUI.prototype.getCssLinks = function() {
	return this.cssLinkArray;
}

/** This method determins which links are new, which are old and which are removed.  
 * @private */
apogeeapp.app.WorkspaceUI.prototype.createLinkAddRemoveList = function(linkArray,oldLinkArray,type,addList,removeList) { 
    
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
    