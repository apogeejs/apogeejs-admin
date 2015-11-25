if(!visicomp.app) visicomp.app = {};
if(!visicomp.app.visiui) visicomp.app.visiui = {};
if(!visicomp.app.visiui.dialog) visicomp.app.visiui.dialog = {};

/** Constructor */
visicomp.app.visiui.VisiComp = function(containerId) {
    
    this.eventManager = new visicomp.core.EventManager();

    //create a menu
    var menuBar = new visicomp.visiui.MenuBar(containerId);
    var menu;

    menu = menuBar.addMenu("File");
    menu.addEventMenuItem("New","menuFileNew",null,this.eventManager);
    menu.addEventMenuItem("Open","menuFileOpen",null,this.eventManager);
    menu.addEventMenuItem("Save","menuFileSave",null,this.eventManager);
    menu.addEventMenuItem("Close","menuFileClose",null,this.eventManager);

    menu = menuBar.addMenu("Workspace");
    menu.addEventMenuItem("Add&nbsp;Package","workspaceAddPackage",null,this.eventManager);
    menu.addEventMenuItem("Add&nbsp;Table","packageAddTable",null,this.eventManager);
    menu.addEventMenuItem("Add&nbsp;Function","packageAddFunction",null,this.eventManager);

    //add some tabs
    this.tabFrame = new visicomp.visiui.TabFrame(containerId);
    this.workspaceUI = null;
    
    //add menu listeners
    var instance = this;
    var newListener = function() {
        if(instance.workspaceOpen()) {
            alert("You must close the existing workspace before opening another.");
            return;
        }
        
        var onCreate = function(name) {
            return instance.createWorkspace(name);
        }
        visicomp.app.visiui.dialog.showCreateWorkspaceDialog(onCreate); 
    }
    this.eventManager.addListener("menuFileNew",newListener);
    
    var openListener = function() {
        if(instance.workspaceOpen()) {
            alert("You must close the existing workspace before opening another.");
            return;
        }
        
        var onOpen = function(workspaceData) {
            return instance.openWorkspace(workspaceData);
        }
        visicomp.app.visiui.dialog.showOpenWorkspaceDialog(onOpen); 
    }
    this.eventManager.addListener("menuFileOpen",openListener);
    
    var saveListener = function() {
        visicomp.app.visiui.dialog.showSaveWorkspaceDialog(instance.workspaceUI); 
    }
    this.eventManager.addListener("menuFileSave",saveListener);
    
    
    var closeListener = function() {
        //add a "are you sure" dialog!!
        instance.closeWorkspace();
    }
    this.eventManager.addListener("menuFileClose",closeListener);
	
	//add worskpace opened listener
    var workspaceOpenedListener = function(object) {
        instance.workspaceOpened(object);
    }
    this.eventManager.addListener(visicomp.core.createworkspace.WORKSPACE_CREATED_EVENT, workspaceOpenedListener);
    
    //initialize business logic handlers
	visicomp.core.createworkspace.initHandler(this.eventManager);
    visicomp.core.createpackage.initHandler(this.eventManager);
    visicomp.core.createtable.initHandler(this.eventManager);
    visicomp.core.createfunction.initHandler(this.eventManager);
    visicomp.core.updatemember.initHandler(this.eventManager);
	visicomp.core.deletechild.initHandler (this.eventManager);
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.VisiComp.prototype.createWorkspace = function(name) {
    //create package
    var handlerData = {};
    handlerData.name = name;
	handlerData.eventManager = this.eventManager;
    var result = this.eventManager.callHandler(
        visicomp.core.createworkspace.CREATE_WORKSPACE_HANDLER,
        handlerData);
    return result;
}


/** This method responds to a "new" menu event. */
visicomp.app.visiui.VisiComp.prototype.workspaceOpened = function(workspace) {
	var tab = this.tabFrame.addTab(workspace.getName());
    this.workspaceUI = new visicomp.app.visiui.WorkspaceUI(workspace,tab);
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.openWorkspace = function(workspaceText) {
	var workspaceJson = JSON.parse(workspaceText);
	return visicomp.app.visiui.workspaceFromJson(this,workspaceJson);
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.closeWorkspace = function() {
    location.reload();
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.workspaceOpen = function() {
    return (this.workspaceUI != null);
}

visicomp.app.visiui.VisiComp.prototype.getEventManager = function() {
	return this.eventManager;
}

