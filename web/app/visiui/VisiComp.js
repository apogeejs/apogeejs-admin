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
    
    //control generators
    this.controlGenerators = {};
    this.standardControls = [];
    //these are a list of names of controls that go in the "added control" list
    this.additionalControls = [];
	
	//external links infrastructure
	this.linkMapByType = {};
	this.linkMapByType.js = {};
	this.linkMapByType.css = {};
	
	//load the standard control generators
	this.loadControlGenerators();
	
	//create the UI
	this.createUI(containerId);
	
	//create a default workspace
	this.createWorkspace(visicomp.app.visiui.VisiComp.DEFAULT_WORKSPACE_NAME);
	
}
	
//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.VisiComp,visicomp.core.EventManager);

visicomp.app.visiui.VisiComp.DEFAULT_WORKSPACE_NAME = "workspace";

visicomp.app.visiui.VisiComp.prototype.getWorkspace = function(name) {
    var workspaceUI = this.getWorkspaceUI(name);
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

visicomp.app.visiui.VisiComp.prototype.getWorkspaceUI = function(name) {
	return this.workspaceUIs[name];
}

visicomp.app.visiui.VisiComp.prototype.getActiveWorkspaceUI = function() {
    var name = this.tabFrame.getActiveTabTitle();
    if(name) {
        return this.workspaceUIs[name];
    }
    else {
        return null;
    }
}

visicomp.app.visiui.VisiComp.prototype.getActiveWorkspace = function() {
    var workspaceUI = this.getActiveWorkspaceUI();
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

//==================================
// Workspace Management
//==================================

/** This method initiatees the open workspace procedure. */
visicomp.app.visiui.VisiComp.prototype.newWorkspaceRequested = function() {
    var instance = this;
    var onCreate = function(name) {
        return instance.createWorkspace(name);
    }
    visicomp.app.visiui.dialog.showCreateWorkspaceDialog(onCreate); 
}

/** This method initiatees the open workspace procedure. */
visicomp.app.visiui.VisiComp.prototype.openWorkspaceRequested = function() {
    var instance = this;
    var onOpen = function(workspaceData) {
        return instance.openWorkspace(workspaceData);
    }
    visicomp.app.visiui.dialog.showOpenWorkspaceDialog(onOpen);
}

/** This method initiatees the save workspace procedure. */
visicomp.app.visiui.VisiComp.prototype.saveWorkspaceRequested = function() {
    var activeWorkspaceUI = this.getActiveWorkspaceUI();
    if(activeWorkspaceUI === null) {
        alert("There is no open workspace.");
        return;
    }

    visicomp.app.visiui.dialog.showSaveWorkspaceDialog(this, activeWorkspaceUI);
}

/** This method creates a new workspace. */
visicomp.app.visiui.VisiComp.prototype.createWorkspace = function(name) {
    
//we can only have one workspace of a given name!
if(this.workspaceUIs[name]) {
    return {"success":false,"msg":"There is already an open workspce with the name " + name};
}
    
    var workspace = new visicomp.core.Workspace(name);
    var tab = this.tabFrame.addTab(name);
    this.tabFrame.setActiveTab(name);
    var workspaceUI = new visicomp.app.visiui.WorkspaceUI(this,workspace,tab);
    this.workspaceUIs[name] = workspaceUI;
    
    var returnValue = {};
    returnValue.success = true;
    returnValue.workspaceUI = workspaceUI;
    returnValue.workspace = workspace;
    return returnValue;
}

/** This method opens an workspace, from the text file. */
visicomp.app.visiui.VisiComp.prototype.openWorkspace = function(workspaceText) {
	var workspaceJson = JSON.parse(workspaceText);
	return visicomp.app.visiui.WorkspaceUI.fromJson(this,workspaceJson);
}

/** This method closes the active workspace. */
visicomp.app.visiui.VisiComp.prototype.closeWorkspace = function() {
    
    //add some kind of warnging!!
    
    var activeWorkspaceUI = this.getActiveWorkspaceUI();
    if(activeWorkspaceUI === null) {
        alert("There is no open workspace.");
        return;
    }
    
    var workspace = activeWorkspaceUI.getWorkspace();
    
    var name = workspace.getName();
    
    //remove the workspace from the app
    delete this.workspaceUIs[name];
    this.tabFrame.removeTab(name);
    workspace.close();
}

//==================================
// Additional Control
//==================================

/** This method lets the user add an additional control from a list of types. */
visicomp.app.visiui.VisiComp.prototype.addAdditionalControl = function() {
    var instance = this;
    
    var onSelect = function(controlType) {
        var generator = instance.controlGenerators[controlType];
        if(generator) {
            var showDialog = instance.getOnCreateRequestedCallback(generator);
            showDialog();
        }
        else {
            alert("Unknown control type: " + controlType);
        }
    }
    //open select control dialog
    visicomp.app.visiui.dialog.showSelectControlDialog(this.additionalControls,onSelect);
    
}

//==================================
// Link Management
//==================================

/** This method initiates the process of updaing the external links. */
visicomp.app.visiui.VisiComp.prototype.updateLinksRequested = function() {
    var activeWorkspaceUI = this.getActiveWorkspaceUI();
    if(!activeWorkspaceUI) {
        alert("There is no open workspace.");
        return;
    }
    visicomp.app.visiui.dialog.showUpdateLinksDialog(activeWorkspaceUI);
}

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
		visicomp.app.visiui.VisiComp.addJsLink(link)
	}
	else if(type === "css") {
		visicomp.app.visiui.VisiComp.addCssLink(link);
	}
}

visicomp.app.visiui.VisiComp.prototype.removeLinkFromPage = function(link,type) {
	//for now do not remove js link, only css
	//we can not unexectue the js script
	//css does get removed
	if(type === "css") {
		visicomp.app.visiui.VisiComp.removeLink(link);
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
    var name = controlGenerator.uniqueName;
    if(this.controlGenerators[name]) {
//in the future we can maybe do something other than punt
        alert("There is already a registered control with this name. Either the control has already been added of the name is not unique.");
        return;
    }

//we should maybe warn if another control bundle is being overwritten 
    this.controlGenerators[name] = controlGenerator;
    this.additionalControls.push(name);
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
visicomp.app.visiui.VisiComp.prototype.loadControlGenerators = function() {
    //standard controls
	this.registerStandardControl(visicomp.app.visiui.FolderControl.generator);
	this.registerStandardControl(visicomp.app.visiui.TableControl.generator);
	this.registerStandardControl(visicomp.app.visiui.FunctionControl.generator);
	
    //additional controls
    this.registerControl(visicomp.app.visiui.CustomResourceControl.generator);
}

/** This method registers a control. 
 * @private */
visicomp.app.visiui.VisiComp.prototype.registerStandardControl = function(controlGenerator) {
    var name = controlGenerator.uniqueName;
    if(this.controlGenerators[name]) {
//in the future we can maybe do something other than punt
        alert("There is already a registered control with this name. Either the control has already been added of the name is not unique.");
        return;
    }

//we should maybe warn if another control bundle is being overwritten 
    this.controlGenerators[name] = controlGenerator;
    this.standardControls.push(name);
}

/** This method creates the app ui. 
 * @private */
visicomp.app.visiui.VisiComp.prototype.createUI = function(containerId) {
    
    //load the UI into tthe given container
    var container = document.getElementById(containerId);
    if(!container) {
        throw visicomp.core.util.createError("Container ID not found: " + containerID);
    }

    //create menus---------------------------------
//mnove this somewhere else... maybe into html    
    var menuBar = document.createElement("div");
    var menuBarStyle = {
        "background-color":"rgb(217,229,250)",
        "padding":"2px"
    }
    visicomp.visiui.applyStyle(menuBar,menuBarStyle);
    container.appendChild(menuBar);
    //----------------------------------------------
    
    //create the menus
    var menu;
    var instance = this;

    //Workspace menu
    menu = visicomp.visiui.Menu.createMenu("Workspace");
    menuBar.appendChild(menu.getElement());
    
    var newCallback = function() {instance.newWorkspaceRequested()};
    menu.addCallbackMenuItem("New",newCallback);
    
    var openCallback = function() {instance.openWorkspaceRequested()};
    menu.addCallbackMenuItem("Open",openCallback);
    
    var saveCallback = function() {instance.saveWorkspaceRequested()};
    menu.addCallbackMenuItem("Save",saveCallback);
    
    var closeCallback = function() {instance.closeWorkspace()};
    menu.addCallbackMenuItem("Close",closeCallback);	
	
    //Controls Menu
    menu = visicomp.visiui.Menu.createMenu("Controls");
    menuBar.appendChild(menu.getElement());
    
    for(var i = 0; i < this.standardControls.length; i++) {
        var key = this.standardControls[i];
        var generator = this.controlGenerators[key];
        var title = visicomp.app.visiui.VisiComp.convertSpacesForHtml("Add " + generator.displayName);
        var callback = this.getOnCreateRequestedCallback(generator);
        menu.addCallbackMenuItem(title,callback);
    }
    
    //add the additional control item
    var controlCallback = function(){instance.addAdditionalControl()};
    menu.addCallbackMenuItem("Other&nbsp;Controls...",controlCallback);
    
    //libraries menu
    menu = visicomp.visiui.Menu.createMenu("Libraries");
    menuBar.appendChild(menu.getElement());
    
    var linksCallback = function() {instance.updateLinksRequested()};
    menu.addCallbackMenuItem("Update&nbsp;Links",linksCallback);

    //create the tab frame - this puts a tab for each workspace, even though
    //for now you can only make one workspace.
    this.tabFrame = new visicomp.visiui.TabFrame(containerId);
    container.appendChild(this.tabFrame.getElement());
    this.tabFrame.resizeElement();
 
}
/** This shows the create control dialog. */
visicomp.app.visiui.VisiComp.prototype.getOnCreateRequestedCallback = function(generator) {
    var instance = this;
    return function() {
        visicomp.app.visiui.dialog.showCreateChildDialog(generator.displayName,
            instance,
            generator.createControl
        );
    }
}

//=================================
// Utility Functions
//=================================

/** This method replaces on spaces with &nbsp; spaces. It is intedned to prevent
 * wrapping in html. */
visicomp.app.visiui.VisiComp.convertSpacesForHtml = function(text) {
    return text.replace(" ","&nbsp;");
}
