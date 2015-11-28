if(!visicomp.app) visicomp.app = {};
if(!visicomp.app.visiui) visicomp.app.visiui = {};
if(!visicomp.app.visiui.dialog) visicomp.app.visiui.dialog = {};

/** Constructor */
visicomp.app.visiui.VisiComp = function(containerId) {
    
//temp - until we figure out what to do with menu and events
visicomp.core.EventManager.init.call(this);

    //create a menu
    var menuBar = new visicomp.visiui.MenuBar(containerId);
    var menu;

    menu = menuBar.addMenu("File");
    menu.addEventMenuItem("New","menuFileNew",null,this);
    menu.addEventMenuItem("Open","menuFileOpen",null,this);
    menu.addEventMenuItem("Save","menuFileSave",null,this);
    menu.addEventMenuItem("Close","menuFileClose",null,this);

    menu = menuBar.addMenu("Workspace");
    menu.addEventMenuItem("Add&nbsp;Package","workspaceAddPackage",null,this);
    menu.addEventMenuItem("Add&nbsp;Table","packageAddTable",null,this);
    menu.addEventMenuItem("Add&nbsp;Function","packageAddFunction",null,this);

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
    this.addListener("menuFileNew",newListener);
    
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
    this.addListener("menuFileOpen",openListener);
    
    var saveListener = function() {
        visicomp.app.visiui.dialog.showSaveWorkspaceDialog(instance.workspaceUI); 
    }
    this.addListener("menuFileSave",saveListener);
    
    
    var closeListener = function() {
        //add a "are you sure" dialog!!
        instance.closeWorkspace();
    }
    this.addListener("menuFileClose",closeListener);
    
    //workspace menu
     //add menu listeners
    var addPackageListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,packageName) {
            return instance.workspaceUI.addPackage(parent,packageName,false);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("package",instance.workspaceUI.objectUIMap,instance.activePackageName,onCreate);
    }
    this.addListener("workspaceAddPackage",addPackageListener);

    var addTableListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,tableName) {
            return instance.workspaceUI.addTable(parent,tableName);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("table",instance.workspaceUI.objectUIMap,instance.activePackageName,onCreate);
    }
    this.addListener("packageAddTable",addTableListener);
    
    var addFunctionListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,functionName) {
            return instance.workspaceUI.addFunction(parent,functionName);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("function",instance.workspaceUI.objectUIMap,instance.activePackageName,onCreate);
    }
    this.addListener("packageAddFunction",addFunctionListener);
}

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.VisiComp,visicomp.core.EventManager);

/** This method creates a new workspace. */
visicomp.app.visiui.VisiComp.prototype.createWorkspace = function(name) {
    var workspace = new visicomp.core.Workspace(name);
    var tab = this.tabFrame.addTab(workspace.getName());
    this.workspaceUI = new visicomp.app.visiui.WorkspaceUI(workspace,tab);
    return {"success":true};
}

/** This method opens an workspace, from the text file. */
visicomp.app.visiui.VisiComp.prototype.openWorkspace = function(workspaceText) {
	var workspaceJson = JSON.parse(workspaceText);
	return visicomp.app.visiui.workspaceFromJson(this,workspaceJson);
}

/** This method closes a workspace. */
visicomp.app.visiui.VisiComp.prototype.closeWorkspace = function() {
    location.reload();
}

/** This method returns true if a workspace is opened. */
visicomp.app.visiui.VisiComp.prototype.workspaceOpen = function() {
    return (this.workspaceUI != null);
}

visicomp.app.visiui.VisiComp.prototype.getWorkspace = function() {
	return this.workspace;
}

visicomp.app.visiui.VisiComp.prototype.getWorkspaceUI = function() {
	return this.workspaceUI;
}
