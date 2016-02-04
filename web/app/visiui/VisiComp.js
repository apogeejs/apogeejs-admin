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
	
	this.linkManager = new visicomp.app.visiui.LinkManager();
	
	//load the standard control generators
	this.loadControlGenerators();
	
	//create the UI
	this.createUI(containerId);
	
	//create a default workspace 
//I don't handle a failed return here!
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
    var onOpen = function(workspaceData,resultCallback) {
        instance.openWorkspace(workspaceData,resultCallback);
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
    var returnValue = {};
    
    try {
        //make the workspace ui
        var workspaceUI = this.makeWorkspaceUI(name);
        var workspace = new visicomp.core.Workspace(name);
        workspaceUI.setWorkspace(workspace);
    
        returnValue.success = true;
        returnValue.workspaceUI = workspaceUI;
    }
    catch(error) {
        returnValue.success = false;
        returnValue.msg = error.message;
    }
    
    return returnValue; 
}

/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
visicomp.app.visiui.VisiComp.prototype.openWorkspace = function(workspaceText,resultCallback) {
    var returnValue = {};
    
    try {
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!    

		//make a blank workspace
		//we might need to load the links before we can deserialize the json
        var name = workspaceJson.workspace.name;
        var workspaceUI =  this.makeWorkspaceUI(name);
    
        //add links
		var jsLinks;
		var cssLinks;
        var linksAdded = false;
        if((workspaceJson.jsLinks)&&(workspaceJson.jsLinks.length > 0)) {
            jsLinks = workspaceJson.jsLinks;
            linksAdded = true;
        }
		else {
			jsLinks = [];
		}
        if((workspaceJson.cssLinks)&&(workspaceJson.cssLinks.length > 0)) {
			cssLinks = workspaceJson.cssLinks;
            linksAdded = true;
        }
		else {
			cssLinks = [];
		}
    	
		//if we have to load links wait for them to load
		if(linksAdded) {
			//deserialize workspace after the links load
            var instance = this;
			var onLinksLoaded = function() {
				var returnValue = instance.loadWorkspace(workspaceUI,workspaceJson);
				resultCallback(returnValue);
			}
			workspaceUI.setLinks(jsLinks,cssLinks,onLinksLoaded,name);
		}
		else {
			//no need to wait to load workspace
			var returnValue = this.loadWorkspace(workspaceUI,workspaceJson);
			resultCallback(returnValue);
		}
    }
    catch(error) {
		console.error(error.stack);
        returnValue.success = false;
        returnValue.msg = error.message;
		resultCallback(returnValue);
    }
}

/** This method closes the active workspace. */
visicomp.app.visiui.VisiComp.prototype.closeWorkspace = function() {
    var returnValue = {};
    
    //add some kind of warnging!!
    try {
        var activeWorkspaceUI = this.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            returnValue.success = false;
            returnValue.msg = "There is no open workspace.";
            return returnValue;
        }

        var workspace = activeWorkspaceUI.getWorkspace();

        var name = workspace.getName();

        //remove the workspace from the app
        delete this.workspaceUIs[name];
        this.tabFrame.removeTab(name);
        workspace.close();
        
        returnValue.success = true;
    }
    catch(error) {
        returnValue.success = false;
        returnValue.msg = error.message;
    }
    
    return returnValue;
}

/** This method makes an empty workspace ui object. 
 * @private */
visicomp.app.visiui.VisiComp.prototype.makeWorkspaceUI = function(name) {
    
    //we can only have one workspace of a given name!
    if(this.workspaceUIs[name]) {
        throw visicomp.core.util.createError("There is already an open workspace with the name " + name);
    }
    
	var tab = this.tabFrame.addTab(name);
//    this.tabFrame.setActiveTab(name);
    var workspaceUI = new visicomp.app.visiui.WorkspaceUI(this,tab);
    this.workspaceUIs[name] = workspaceUI;
    
    return workspaceUI;
}

/** This method loads an existing workspace into an empty workspace UI. */
visicomp.app.visiui.VisiComp.prototype.loadWorkspace = function(workspaceUI,workspaceJson) {
    var workspaceDataJson = workspaceJson.workspace;
    var workspaceControlsJson = workspaceJson.controls;

    var workspace = new visicomp.core.Workspace(workspaceDataJson);
    
    workspaceUI.setWorkspace(workspace,workspaceControlsJson);
	
	return {"success":true};
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
visicomp.app.visiui.VisiComp.prototype.updateWorkspaceLinks = function(workspaceName,addList,removeList,linksLoadedCallback) {
	this.linkManager.updateWorkspaceLinks(workspaceName,addList,removeList,linksLoadedCallback);
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
    this.registerStandardControl(visicomp.app.visiui.WorksheetControl.generator);
	
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
    
    var windowElements = visicomp.visiui.initWindows(containerId);
    var container = windowElements.baseElement;
    
    //-------------------
    //create menus
    //-----------------------
    var menuBar = document.createElement("div");
    var menuBarStyle = {
        "background-color":"rgb(217,229,250)",
        "padding":"2px"
    }
    visicomp.visiui.applyStyle(menuBar,menuBarStyle);
    container.appendChild(menuBar);
    
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

    //----------------------
    //create the tab frame - there is a tab for each workspace
    //--------------------------
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
// Static Functions
//=================================

/** This method replaces on spaces with &nbsp; spaces. It is intedned to prevent
 * wrapping in html. */
visicomp.app.visiui.VisiComp.convertSpacesForHtml = function(text) {
    return text.replace(" ","&nbsp;");
}
