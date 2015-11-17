/* 
 * Constructor
 */
visicomp.app.visiui.WorkspaceUI = function(name,eventManager,tab) {
    //properties
    this.name = name;
    this.tab = tab;
    this.packages = {};
    this.activePackageName = null;
    this.workspace = new visicomp.core.Workspace(name,eventManager);
    this.eventManager = eventManager;
    
    //listeners
    var instance = this;
    
    //add menu listeners
    var addPackageListener = function() {
        var onCreate = function(name) {
//add all to root
var parent = instance.workspace.getRootPackage();
            return instance.addPackage(name,parent);
        }
        visicomp.app.visiui.dialog.createPackageDialog(onCreate);
    }
    this.eventManager.addListener("workspaceAddPackage",addPackageListener);

    var addTableListener = function() {
        var onCreate = function(package,tableName) {
            return instance.addTable(package,tableName);
        }
        visicomp.app.visiui.dialog.createTableDialog(instance.packages,instance.activePackageName,onCreate);
    }
    this.eventManager.addListener("packageAddTable",addTableListener);
    
    //add package created listener
    var packageAddedListener = function(package) {
        instance.packageAdded(package);
    }
    this.eventManager.addListener(visicomp.core.createpackage.WORKSHEET_CREATED_EVENT, packageAddedListener);
    
    //add table created listener
    var tableAddedListener = function(table) {
        instance.tableAdded(table);
    }
    this.eventManager.addListener(visicomp.core.createtable.TABLE_CREATED_EVENT, tableAddedListener);
}

visicomp.app.visiui.WorkspaceUI.newTableX = 100;
visicomp.app.visiui.WorkspaceUI.newTableY = 50;

visicomp.app.visiui.WorkspaceUI.newTableDeltaX = 50;
visicomp.app.visiui.WorkspaceUI.newTableDeltaY = 50;

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.addPackage = function(name,parent) {
    //create package
    var handlerData = {};
    handlerData.name = name;
	handlerData.parent = parent;
    handlerData.workspace = this.workspace;
    var result = this.eventManager.callHandler(
        visicomp.core.createpackage.CREATE_WORKSHEET_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.packageAdded = function(package) {
    //make sure this is for us
    if(package.getWorkspace() != this.workspace) return;
	
	var parent = package.getParent();
	var parentContainer;
	if(parent) {
		var packageInfo = this.packages[parent.getFullName()];
		parentContainer = packageInfo.packageUI.getContentElement();
	}
	else {
		parentContainer = this.tab;
	}
	
	//create the package
	var packageUI = new visicomp.visiui.PackageUI(package,parentContainer);
	
    var packageInfo = {};
	packageInfo.package = package;
	packageInfo.packageUI = packageUI;
	packageInfo.tables = {};
	
    this.packages[package.getFullName()] = packageInfo;
    
    //show the table
    var window = packageUI.getWindow();
    window.setPosition(visicomp.app.visiui.WorkspaceUI.newTableX,visicomp.app.visiui.WorkspaceUI.newTableY);
    visicomp.app.visiui.WorkspaceUI.newTableX += visicomp.app.visiui.WorkspaceUI.newTableDeltaX;
    visicomp.app.visiui.WorkspaceUI.newTableY += visicomp.app.visiui.WorkspaceUI.newTableDeltaY;
    window.show();
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.addTable = function(package, name) {
    //create table
    var handlerData = {};
    handlerData.name = name;
    handlerData.package = package;
    var result = this.eventManager.callHandler(
        visicomp.core.createtable.CREATE_TABLE_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.tableAdded = function(table) {

    var package = table.getPackage();
	
	//make sure this is for us
    if(package.getWorkspace() != this.workspace) return;
	
	var packageInfo = this.packages[package.getFullName()];
	var container = packageInfo.packageUI.getContentElement();
    
    //create the table
    var tableUI = new visicomp.visiui.TableUI(table,container);
    
    //store the table info
    var tableInfo = {"table":table,"tableUI":tableUI};
    packageInfo.tables[table.getName()] = tableInfo;
    
    //show the table
    var window = tableUI.getWindow();
    window.setPosition(visicomp.app.visiui.WorkspaceUI.newTableX,visicomp.app.visiui.WorkspaceUI.newTableY);
    visicomp.app.visiui.WorkspaceUI.newTableX += visicomp.app.visiui.WorkspaceUI.newTableDeltaX;
    visicomp.app.visiui.WorkspaceUI.newTableY += visicomp.app.visiui.WorkspaceUI.newTableDeltaY;
    window.show();
}

