if(!visicomp.app) visicomp.app = {};
if(!visicomp.app.visiui) visicomp.app.visiui = {};
if(!visicomp.app.visiui.dialog) visicomp.app.visiui.dialog = {};

/** This is the main class of the visicomp application. */
visicomp.app.visiui.VisiComp = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    visicomp.core.EventManager.init.call(this);
    
    //workspaces
    this.workspaceUIs = {};
//I am limiting to one for now. later I will udpate to allow more
this.singleLoadedWorkspace = null;
    
    //control generators
    this.controlGenerators = {};
    //these are a list of names of controls that go in the "added control" list
    this.additionalControls = [];
	
	//external links infrastructure
	this.linkMapByType = {};
	this.linkMapByType.js = {};
	this.linkMapByType.css = {};
	
	//load the standard control generators
	this.loadStandardControlGenerators();
	
	//create the UI
	this.createUI(containerId);
	
	//create a default workspace
//	this.createWorkspace(visicomp.app.visiui.VisiComp.DEFAULT_WORKSPACE_NAME);
	
}
	

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.VisiComp,visicomp.core.EventManager);

visicomp.app.visiui.VisiComp.DEFAULT_WORKSPACE_NAME = "workspace";

//------------------------------------------------------------------------------
//WE NEED TO MANAGE THESE DIFFERENTLY WHEN WE ALLOW MUTLIPLE WORKSPACES

visicomp.app.visiui.VisiComp.prototype.getWorkspace = function() {
    var workspaceUI = this.getWorkspaceUI();
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

visicomp.app.visiui.VisiComp.prototype.getWorkspaceUI = function() {
	if(this.singleLoadedWorkspace !== null) {
		return this.workspaceUIs[this.singleLoadedWorkspace];
	}
	else {
		return null;
	}
}
//------------------------------------------------------------------------------

/** This method creates a new workspace. */
visicomp.app.visiui.VisiComp.prototype.createWorkspace = function(name) {
    
//we can only have one workspace of a given name!    
    
    var workspace = new visicomp.core.Workspace(name);
    var tab = this.tabFrame.addTab(workspace.getName());
    var workspaceUI = new visicomp.app.visiui.WorkspaceUI(this,workspace,tab);
    this.workspaceUIs[name] = workspaceUI;
    return {"success":true};
}

/** This method opens an workspace, from the text file. */
visicomp.app.visiui.VisiComp.prototype.openWorkspace = function(workspaceText) {
	var workspaceJson = JSON.parse(workspaceText);
	return visicomp.app.visiui.Workspace.fromJson(this,workspaceJson);
}

/** This method closes a workspace. */
visicomp.app.visiui.VisiComp.prototype.closeWorkspace = function() {
    
//this closes all! Fix
    
    location.reload();
}

visicomp.app.visiui.VisiComp.prototype.addControl = function(control) {
    var workspace = control.getWorkspace();
    var workspaceUI = this.workspaceUIs[workspace.getName()];
    if(workspaceUI) {
        return workspaceUI.addControl(control);
    }
    else {
        throw visicomp.core.util.createError("Workspace not found: " + workspace.getName()); 
    }
}

//==================================
// Link Management
//==================================

/** This method adds links as registered by a given workspace. Links can be added and
 * removed. Removing links may or may not remove them from the page (currently
 * js links are not removed and css links are, once they are not used by any 
 * workspase. The linksLoadedCallback is optional. It is called when all links have
 * been loaded on the page. CALLBACK NOT CURRENTLY IMPLEMENTED!!!
 */
visicomp.app.visiui.VisiComp.prototype.updateWorkspaceLinks = function(workspaceName,addList,removeList,type,linksLoadedCallback) {
	
	var i;
	var cnt;
	var index;
	var link;
	var linkWorkspaces;
	
	//retrieve link workspaces base on type
	var linkMap = this.linkMapByType[type];
	if(!linkMap) {
		alert("Unrecognized link type: " + type);
		return;
	}
	
	//remove the workspace for this link
	cnt = removeList.length;
	for(i = 0; i < cnt; i++) {
		link = removeList[i];
		linkWorkspaces = linkMap[link];
		if(linkWorkspaces) {
			index = linkWorkspaces.indexOf(link);
			if(index !== -1) {
				//remove the workspace from this link
				linkWorkspaces.splice(i,1);
				if(linkWorkspaces.length === 0) {
					//nobody references this link
					//try to remove it (it might not be removeable
					var linkRemoved = this.removeLinkFromPage(link,type);
					if(linkRemoved) {
						delete linkMap[link];
					}
				}
			}
			else {
				//workspace already removed - no action
			}
		}
		else {
			//link does not exist - no action
		}
	}
	
	//remove the workspace for this link
	cnt = addList.length;
	for(i = 0; i < cnt; i++) {
		link = addList[i];
		linkWorkspaces = linkMap[link];
		if(linkWorkspaces) {
			//link already present on page
			index = linkWorkspaces.indexOf(link);
			if(index != -1) {
				//workspace already has link - no action
			}
			else {
				//add workspace to link
				linkWorkspaces.push(workspaceName);
			}
		}
		else {
			//link must be added, and workspace added to link
			linkWorkspaces = [];
			linkWorkspaces.push(workspaceName);
			linkMap[link] = linkWorkspaces;
			this.addLinkToPage(link,type);
		}
	}
}

visicomp.app.visiui.VisiComp.prototype.addLinkToPage = function(link,type) {
	if(type === "js") {
		this.addJsLink(link)
	}
	else if(type === "css") {
		this.addCssLink(link);
	}
}

visicomp.app.visiui.VisiComp.prototype.removeLinkFromPage = function(link,type) {
	//for now do not remove js link, only css
	//we can not unexectue the js script
	//css does get removed
	if(type === "css") {
		this.removeLink(link);
		return true;
	}
	else {
		return false;
	}
}

/** @private */
visicomp.app.visiui.VisiComp.addJsLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
        element = visicomp.visiui.createElement("script",{"id":link,"src":link});
        document.head.appendChild(element);
    }
}

/** @private */
visicomp.app.visiui.VisiComp.addCssLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
        element = visicomp.visiui.createElement("link",{"id":link,"rel":"stylesheet","type":"text/css","href":link});
        document.head.appendChild(element);
    }
}

/** @private */
visicomp.app.visiui.VisiComp.removeLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(element) {
        document.head.removeChild(element);
    }
}

//=================================
// Control Management
//=================================

/** This method registers a control. */
visicomp.app.visiui.VisiComp.prototype.registerControl = function(controlGenerator) {
    var name = controlGenerator.name;
    if(this.controlGenerators[name]) {
//in the future we can maybe do something other than punt
        alert("There is already a registered control with this name. Either the control has already been added of the name is not unique.");
        return;
    }

//we should maybe warn if another control bundle is being overwritten 
    this.controlGenerators[name] = controlGenerator;
    this.addedControls.push(name);
}

/** This method registers a control. */
visicomp.app.visiui.VisiComp.prototype.getControlGenerator = function(name) {
	return this.controlGenerators[name];
}
//==========================
// App Initialization
//==========================

/** This method adds the standard controls to the app. 
 * @private */
visicomp.app.visiui.VisiComp.prototype.loadStandardControlGenerators = function() {
	this.controlGenerators[visicomp.app.visiui.FolderControl.generator.name] = visicomp.app.visiui.FolderControl.generator;
	this.controlGenerators[visicomp.app.visiui.TableControl.generator.name] = visicomp.app.visiui.TableControl.generator;
	this.controlGenerators[visicomp.app.visiui.FunctionControl.generator.name] = visicomp.app.visiui.FunctionControl.generator;
	this.controlGenerators[visicomp.app.visiui.CustomResourceControl.generator.name] = visicomp.app.visiui.CustomResourceControl.generator;
}

/** This method creates the app ui. 
 * @private */
visicomp.app.visiui.VisiComp.prototype.createUI = function(containerId) {

    //create menus
    var menuBar = new visicomp.visiui.MenuBar(containerId);
    var menu;

    menu = menuBar.addMenu("File");
    menu.addEventMenuItem("New","menuFileNew",null,this);
    menu.addEventMenuItem("Open","menuFileOpen",null,this);
    menu.addEventMenuItem("Save","menuFileSave",null,this);
    menu.addEventMenuItem("Close","menuFileClose",null,this);

	var app = this;
	
    menu = menuBar.addMenu("Workspace");
    menu.addCallbackMenuItem("Add&nbsp;Folder",function() {app.controlGenerators.Folder.showCreateDialog(app)});
    menu.addCallbackMenuItem("Add&nbsp;Table",function() {
		app.controlGenerators.Table.showCreateDialog(app)
	});
    menu.addCallbackMenuItem("Add&nbsp;Function",function() {app.controlGenerators.Function.showCreateDialog(app)});
	menu.addCallbackMenuItem("Add&nbsp;Custom&nbsp;Control",function() {app.controlGenerators.CustomResource.showCreateDialog(app)});
    
    menu = menuBar.addMenu("Libraries");
    menu.addEventMenuItem("Update&nbsp;Links","externalLinks",null,this);

    //create the tab frame - this puts a tab for each workspace, even though
    //for now you can only make one workspace.
    this.tabFrame = new visicomp.visiui.TabFrame(containerId);
    this.workspaceUI = null;
    
    //add menu listeners
    var instance = this;
    
    //create new listener
    var newListener = function() {
        if(instance.singleLoadedWorkspace !== null) {
            //one workspace for now
            alert("You must close the existing workspace before opening another.");
            return;
        }
        
        var onCreate = function(name) {
            var returnValue = instance.createWorkspace(name);
if(returnValue.success) instance.singleLoadedWorkspace = name;
            return returnValue;
        }
        visicomp.app.visiui.dialog.showCreateWorkspaceDialog(onCreate); 
    }
    this.addListener("menuFileNew",newListener);
    
    //open listener
    var openListener = function() {
        if(instance.singleLoadedWorkspace !== null) {
            //one workspace for now
            alert("You must close the existing workspace before opening another.");
            return;
        }
        
        var onOpen = function(workspaceData) {
            var returnValue = instance.openWorkspace(workspaceData);
if(returnValue.success) instance.singleLoadedWorkspace = workspaceData.name;
            return returnValue;
        }
        visicomp.app.visiui.dialog.showOpenWorkspaceDialog(onOpen); 
    }
    this.addListener("menuFileOpen",openListener);
    
    //save listener
    var saveListener = function() {
        if(instance.singleLoadedWorkspace === null) {
            alert("There is no open workspace.");
            return;
        }
        
        visicomp.app.visiui.dialog.showSaveWorkspaceDialog(instance, instance.workspaceUI); 
    }
    this.addListener("menuFileSave",saveListener);
    
    //close listener
    var closeListener = function() {
        if(instance.workspaceLoaded === null) {
            alert("There is no open workspace.");
            return;
        }
        
        //for now this reloads - when we fix this make sure it does everything it needs
        //to to get rid of the workspace
        instance.closeWorkspace();
    }
    this.addListener("menuFileClose",closeListener);
    
    //external menu
    //add links listener
    var udpateLinksListener = function() {
        visicomp.app.visiui.dialog.showUpdateLinksDialog(instance);
    }
    this.addListener("externalLinks",udpateLinksListener);
}
