/* 
 * Constructor
 */
visicomp.app.visiui.WorkspaceUI = function(workspace,tab) {
    //properties
    this.tab = tab;
    this.objectUIMap = {};
    this.activePackageName = null;
    this.workspace = workspace;
    this.name = workspace.getName();
    
    
/////////////////////////////////////////////
var rootPackage = workspace.getRootPackage();
var objectInfo = {};
	objectInfo.object = rootPackage;
    //no ui object!!!
	
    this.objectUIMap[this.getObjectKey(rootPackage)] = objectInfo;

/////////////////////////////////////////////
	
    //listeners
    var instance = this;
    
    //add package created listener
    var objectAddedListener = function(object) {
        instance.objectAdded(object);
    }
    this.workspace.addListener(visicomp.core.createpackage.PACKAGE_CREATED_EVENT, objectAddedListener);
    this.workspace.addListener(visicomp.core.createtable.TABLE_CREATED_EVENT, objectAddedListener);
    this.workspace.addListener(visicomp.core.createfunction.FUNCTION_CREATED_EVENT, objectAddedListener);
	
	//add package created listener
    var childDeletedListener = function(objectFullName) {
        instance.childDeleted(objectFullName);
    }
    this.workspace.addListener(visicomp.core.deletechild.CHILD_DELETED_EVENT, childDeletedListener);
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
visicomp.app.visiui.WorkspaceUI.prototype.getChildUIObject = function(childObject) {
    var key = this.getObjectKey(childObject);
	var objectInfo = this.objectUIMap[key][key];
	return objectInfo.objectUI;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.addPackage = function(parent,name,isRoot) {
    //create package
    var handlerData = {};
    handlerData.name = name;
	handlerData.parent = parent;
    handlerData.workspace = this.workspace;
	handlerData.isRoot = isRoot;
    var result = this.workspace.callHandler(
        visicomp.core.createpackage.CREATE_PACKAGE_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.addTable = function(parent, name) {
    //create table
    var handlerData = {};
    handlerData.name = name;
    handlerData.package = parent;
    var result = this.workspace.callHandler(
        visicomp.core.createtable.CREATE_TABLE_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.addFunction = function(parent, declarationName) {
	
	//seperate name and arglist
//get a reg ex and chck format
	var nameLength = declarationName.indexOf("(");
	if(nameLength < 0) {
		alert("Include the argument list with the name.");
		return {"success":false};
	}
    var name = declarationName.substr(0,nameLength);
    var argParens = declarationName.substr(nameLength);
	
    //create table
    var handlerData = {};
    handlerData.name = name;
	handlerData.argParens = argParens;
    handlerData.package = parent;
    var result = this.workspace.callHandler(
        visicomp.core.createfunction.CREATE_FUNCTION_HANDLER,
        handlerData);
    return result;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.objectAdded = function(object) {
    //make sure this is for us
    if(object.getWorkspace() !== this.workspace) return;
	
	var parent = object.getParent();
    var objectInfo = this.objectUIMap[this.getObjectKey(parent)];
	var parentContainer;
	if(objectInfo.objectUI) {
		parentContainer = objectInfo.objectUI.getContentElement();
	}
	else {
		parentContainer = this.tab;
	}
	
	//create the ui object
	var objectUI = new visicomp.app.visiui.ChildUI(object,parentContainer);
	
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
	if(window) {
		window.setPosition(visicomp.app.visiui.WorkspaceUI.newTableX,visicomp.app.visiui.WorkspaceUI.newTableY);
		visicomp.app.visiui.WorkspaceUI.newTableX += visicomp.app.visiui.WorkspaceUI.newTableDeltaX;
		visicomp.app.visiui.WorkspaceUI.newTableY += visicomp.app.visiui.WorkspaceUI.newTableDeltaY;
		window.show();
	}
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.childDeleted = function(fullName) {

//we should verify the workspace!
	
	//store the ui object
	var key = fullName;
	
	var objectInfo = this.objectUIMap[key];
	delete this.objectUIMap[key];

	if((objectInfo)&&(objectInfo.objectUI)) {
		objectInfo.objectUI.removeFromParent();	
	}
}

visicomp.app.visiui.WorkspaceUI.prototype.getObjectKey = function(object) {
//needs to be changed when we add worksheets
	return object.getFullName();
}

