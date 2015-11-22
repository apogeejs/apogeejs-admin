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
    
    //initialize business logic handlers

    visicomp.core.createpackage.initHandler(this.eventManager);
    visicomp.core.createtable.initHandler(this.eventManager);
    visicomp.core.createfunction.initHandler(this.eventManager);
    visicomp.core.updatemember.initHandler(this.eventManager);
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.VisiComp.prototype.createWorkspace = function(name) {
    
	var tab = this.tabFrame.addTab(name);
//we probably want to do this differently
//create workspace ui, which also creates workspace object
    this.workspaceUI = new visicomp.app.visiui.WorkspaceUI(name,this.eventManager,tab);
//add the root package here
	this.workspaceUI.addPackage(this.workspaceUI.workspace,name,true);
    
    return {"success":true};
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.openWorkspace = function(workspaceText) {
	
alert("Needs to be fixed!");
if(true) return;
    
    var workspaceData = JSON.parse(workspaceText);
    
    //create workspace
    var workspaceName = workspaceData.name;
    this.createWorkspace(workspaceName);
    var workspace = this.workspaceUI.getWorkspace();
    
    //this will be used to command the table update
    var tableUpdateList = [];
    
    //create packages
    for(var packageName in workspaceData.packages) {
        //create and lookup package
        var packageData = workspaceData.packages[packageName];
//need to add the proper parent
        this.workspaceUI.addPackage(packageData.name);
        var package = workspace.lookupPackage(packageData.name);
        
        //create tables for this package
        for(var tableName in packageData.tables) {
            var tableData = packageData.tables[tableName];
            this.workspaceUI.addTable(package,tableData.name);
            var table = package.lookupChild(tableData.name);
            
            //save the data to set the tables' value or formula
            var tableUpdateData = {};
            tableUpdateData.member = table;
            tableUpdateData.formula = tableData.formula;
            tableUpdateData.supplementalCode = tableData.supplementalCode;
            tableUpdateData.data = tableData.data;
            tableUpdateList.push(tableUpdateData);
        }
    }
    
    //update the tables
    var result = this.eventManager.callHandler(
            visicomp.core.updatemember.UPDATE_MEMBERS_HANDLER,tableUpdateList);
        
    return result;
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.closeWorkspace = function() {
    location.reload();
}

/** This method responds to a "open" menu event. */
visicomp.app.visiui.VisiComp.prototype.workspaceOpen = function() {
    return (this.workspaceUI != null);
}

