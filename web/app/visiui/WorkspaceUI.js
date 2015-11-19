/* 
 * Constructor
 */
visicomp.app.visiui.WorkspaceUI = function(name,eventManager,tab) {
    //properties
    this.name = name;
    this.tab = tab;
    this.objectUIMap = {};
    this.activePackageName = null;
    this.workspace = new visicomp.core.Workspace(name,eventManager);
    this.eventManager = eventManager;
    
    //listeners
    var instance = this;
    
    //add menu listeners
    var addPackageListener = function() {
        var onCreate = function(parent,packageName) {
            return instance.addPackage(parent,packageName,false);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("package",instance.objectUIMap,instance.activePackageName,onCreate);
    }
    this.eventManager.addListener("workspaceAddPackage",addPackageListener);

    var addTableListener = function() {
        var onCreate = function(parent,tableName) {
            return instance.addTable(parent,tableName);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("table",instance.objectUIMap,instance.activePackageName,onCreate);
    }
    this.eventManager.addListener("packageAddTable",addTableListener);
    
    //add package created listener
    var objectAddedListener = function(object) {
        instance.objectAdded(object);
    }
    this.eventManager.addListener(visicomp.core.createpackage.WORKSHEET_CREATED_EVENT, objectAddedListener);
    this.eventManager.addListener(visicomp.core.createtable.TABLE_CREATED_EVENT, objectAddedListener);
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
visicomp.app.visiui.WorkspaceUI.prototype.addPackage = function(parent,name,isRoot) {
    //create package
    var handlerData = {};
    handlerData.name = name;
	handlerData.parent = parent;
    handlerData.workspace = this.workspace;
	handlerData.isRoot = isRoot;
    var result = this.eventManager.callHandler(
        visicomp.core.createpackage.CREATE_WORKSHEET_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
//visicomp.app.visiui.WorkspaceUI.prototype.packageAdded = function(package) {
//    //make sure this is for us
//    if(package.getWorkspace() != this.workspace) return;
//	
//	var parent = package.getParent();
//	var parentContainer;
//	if(parent) {
//		var packageInfo = this.packages[parent.getFullName()];
//		parentContainer = packageInfo.packageUI.getContentElement();
//	}
//	else {
//		parentContainer = this.tab;
//	}
//	
//	//create the package
//	var packageUI = new visicomp.visiui.PackageUI(package,parentContainer);
//	
//    var packageInfo = {};
//	packageInfo.package = package;
//	packageInfo.packageUI = packageUI;
//	packageInfo.tables = {};
//	
//    this.packages[package.getFullName()] = packageInfo;
//    
//    //show the table
//    var window = packageUI.getWindow();
//    window.setPosition(visicomp.app.visiui.WorkspaceUI.newTableX,visicomp.app.visiui.WorkspaceUI.newTableY);
//    visicomp.app.visiui.WorkspaceUI.newTableX += visicomp.app.visiui.WorkspaceUI.newTableDeltaX;
//    visicomp.app.visiui.WorkspaceUI.newTableY += visicomp.app.visiui.WorkspaceUI.newTableDeltaY;
//    window.show();
//}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.addTable = function(parent, name) {
    //create table
    var handlerData = {};
    handlerData.name = name;
    handlerData.package = parent;
    var result = this.eventManager.callHandler(
        visicomp.core.createtable.CREATE_TABLE_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
//visicomp.app.visiui.WorkspaceUI.prototype.tableAdded = function(table) {
//
//    var package = table.getPackage();
//	
//	//make sure this is for us
//    if(package.getWorkspace() != this.workspace) return;
//	
//	var packageInfo = this.packages[package.getFullName()];
//	var container = packageInfo.packageUI.getContentElement();
//    
//    //create the table
//    var tableUI = new visicomp.visiui.TableUI(table,container);
//    
//    //store the table info
//    var tableInfo = {"table":table,"tableUI":tableUI};
//    packageInfo.tables[table.getName()] = tableInfo;
//    
//    //show the table
//    var window = tableUI.getWindow();
//    window.setPosition(visicomp.app.visiui.WorkspaceUI.newTableX,visicomp.app.visiui.WorkspaceUI.newTableY);
//    visicomp.app.visiui.WorkspaceUI.newTableX += visicomp.app.visiui.WorkspaceUI.newTableDeltaX;
//    visicomp.app.visiui.WorkspaceUI.newTableY += visicomp.app.visiui.WorkspaceUI.newTableDeltaY;
//    window.show();
//}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.objectAdded = function(object) {
    //make sure this is for us
    if(object.getWorkspace() !== this.workspace) return;
	
	var parent = object.getParent();
	var parentContainer;
	if(parent.getType() === "workspace") {
		parentContainer = this.tab;
	}
	else {
		var objectInfo = this.objectUIMap[this.getObjectKey(parent)];
		parentContainer = objectInfo.objectUI.getContentElement();
	}
	
	//create the object
	var type = object.getType();
	var objectUI;
	switch(type) {
		case "package":
			objectUI = new visicomp.visiui.PackageUI(object,parentContainer);
			break;
			
		case "table":
			objectUI = new visicomp.visiui.TableUI(object,parentContainer);
			break
			
		default:
			alert("Unknown object type: " + type);
			return;
	}
	
	//store the ui object
	var key = this.getObjectKey(object);
	
	if(this.objectUIMap[key]) {
		alert("Unknown error - there is already an object with this object key: " + key);
		return;
	}
	
    var objectInfo = {};
	objectInfo.object = object;
	objectInfo.objectUI = objectUI;
	
    this.objectUIMap[key] = objectInfo;
    
    //show the table
    var window = objectUI.getWindow();
    window.setPosition(visicomp.app.visiui.WorkspaceUI.newTableX,visicomp.app.visiui.WorkspaceUI.newTableY);
    visicomp.app.visiui.WorkspaceUI.newTableX += visicomp.app.visiui.WorkspaceUI.newTableDeltaX;
    visicomp.app.visiui.WorkspaceUI.newTableY += visicomp.app.visiui.WorkspaceUI.newTableDeltaY;
    window.show();
}

visicomp.app.visiui.WorkspaceUI.prototype.getObjectKey = function(object) {
//needs to be changed when we add worksheets
	return object.getFullName();
}

