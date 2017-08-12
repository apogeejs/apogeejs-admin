/** This class manages the user interface for a workspace object. */
apogeeapp.webapp.WorkspaceUI = function() {

    this.workspace = null;
	
    //properties
	this.app = null;
    this.componentMap = {};
   
    this.jsLinkArray = [];
    this.cssLinkArray = [];
}

apogeeapp.webapp.WorkspaceUI.MAIN_WORKSPACE_NAME = "main workspace";

/** This sets the application. It must be done before the workspace is set. */
apogeeapp.webapp.WorkspaceUI.prototype.setApp = function(app) {
    this.app = app;
}

/** This gets the application instance. */
apogeeapp.webapp.WorkspaceUI.prototype.getApp = function() {
    return this.app;
}

 /** This method sets the workspace. The argument componentsJson should be included
  * if the workspace is not empty, such as when opening a existing workspace. It
  * contains the data for the component associated with each workspace member. For 
  * a new empty workspace the componentsJson should be omitted. */
apogeeapp.webapp.WorkspaceUI.prototype.setWorkspace = function(workspace, componentsJson) {   
    this.workspace = workspace; 
    
    //set up the root folder
    var rootFolder = this.workspace.getRoot();
    var rootFolderComponent = new apogeeapp.app.FolderComponent(this,rootFolder);
    if(componentsJson) {
        this.loadFolderComponentContentFromJson(rootFolder,componentsJson);
    }
    
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
apogeeapp.webapp.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method gets the component associated with a member object. */
apogeeapp.webapp.WorkspaceUI.prototype.getComponent = function(member) {
	var componentInfo = this.componentMap[member.getId()];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This method gets the component associated with a member object. */
apogeeapp.webapp.WorkspaceUI.prototype.getComponentById = function(memberId) {
	var componentInfo = this.componentMap[memberId];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This method registers a member data object and its associated component object.
 * If the member is not the main member assoicated with component but instead an included
 * member, the main componentMember should be passed in also. Otherwise it should be left 
 * undefined. */
apogeeapp.webapp.WorkspaceUI.prototype.registerMember = function(member,component,mainComponentMember) {
    
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
    componentInfo.member = member;
	componentInfo.component = component;
    if(mainComponentMember) componentInfo.componentMember = mainComponentMember;
	
    this.componentMap[memberId] = componentInfo;
    
}
	

/** This method responds to a member updated. */
apogeeapp.webapp.WorkspaceUI.prototype.memberUpdated = function(memberObject) {
    //store the ui object
	var key = memberObject.getId();
    
	var componentInfo = this.componentMap[key];
	if((componentInfo)&&(componentInfo.component)) {
        componentInfo.component.memberUpdated();
    }
}

/** This method responds to a "new" menu event. */
apogeeapp.webapp.WorkspaceUI.prototype.childDeleted = function(member) {
	
	//store the ui object
	var memberId = member.getId();
	
	var componentInfo = this.componentMap[memberId];
	delete this.componentMap[memberId];

	if((componentInfo)&&(componentInfo.component)) {
        //do any needed cleanup
        componentInfo.component.onDelete();
	}
}

/** This method gets the workspace object. */
apogeeapp.webapp.WorkspaceUI.prototype.close = function() {
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
// open
//====================================

apogeeapp.webapp.WorkspaceUI.prototype.loadFolderComponentContentFromJson = function(folder,json) {
	for(var key in json) {
		var childJson = json[key];
		var childMember = folder.lookupChild(key);	
		this.loadComponentFromJson(childMember,childJson);
	}
}

apogeeapp.webapp.WorkspaceUI.prototype.loadComponentFromJson = function(member,json) {
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

apogeeapp.webapp.WorkspaceUI.prototype.getJsLinks = function() {
	return this.jsLinkArray;
}

apogeeapp.webapp.WorkspaceUI.prototype.setLinks = function(newJsLinkArray,newCssLinkArray,onLinksLoaded) {
    //update the page links
    var oldJsLinkArray = this.jsLinkArray;
	var oldCssLinkArray = this.cssLinkArray;
	var addList = [];
	var removeList = [];
	
    this.createLinkAddRemoveList(newJsLinkArray,oldJsLinkArray,"js",addList,removeList);
	this.createLinkAddRemoveList(newCssLinkArray,oldCssLinkArray,"css",addList,removeList);
	
    this.jsLinkArray = newJsLinkArray;
	this.cssLinkArray = newCssLinkArray;
	this.app.updateWorkspaceLinks(apogeeapp.webapp.WorkspaceUI.MAIN_WORKSPACE_NAME,addList,removeList,onLinksLoaded);
}

apogeeapp.webapp.WorkspaceUI.prototype.getCssLinks = function() {
	return this.cssLinkArray;
}

/** This method determins which links are new, which are old and which are removed.  
 * @private */
apogeeapp.webapp.WorkspaceUI.prototype.createLinkAddRemoveList = function(linkArray,oldLinkArray,type,addList,removeList) { 
    
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
    