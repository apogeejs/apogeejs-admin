/* 
 * Constructor
 */
visicomp.app.visiui.WorkspaceUI = function(workspace,tab) {
    //properties
    this.tab = tab;
    this.objectUIMap = {};
    this.activePackageName = null;
    this.workspace = workspace;
    this.eventManager = workspace.getEventManager();
    this.name = workspace.getName();
	
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
    
    var addFunctionListener = function() {
        var onCreate = function(parent,functionName) {
            return instance.addFunction(parent,functionName);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("function",instance.objectUIMap,instance.activePackageName,onCreate);
    }
    this.eventManager.addListener("packageAddFunction",addFunctionListener);
    
    //add package created listener
    var objectAddedListener = function(object) {
        instance.objectAdded(object);
    }
    this.eventManager.addListener(visicomp.core.createpackage.PACKAGE_CREATED_EVENT, objectAddedListener);
    this.eventManager.addListener(visicomp.core.createtable.TABLE_CREATED_EVENT, objectAddedListener);
    this.eventManager.addListener(visicomp.core.createfunction.FUNCTION_CREATED_EVENT, objectAddedListener);
	
	//add package created listener
    var childDeletedListener = function(objectFullName) {
        instance.childDeleted(objectFullName);
    }
    this.eventManager.addListener(visicomp.core.deletechild.CHILD_DELETED_EVENT, childDeletedListener);
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
    var result = this.eventManager.callHandler(
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
    var result = this.eventManager.callHandler(
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
    var result = this.eventManager.callHandler(
        visicomp.core.createfunction.CREATE_FUNCTION_HANDLER,
        handlerData);
    return result;
}

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
			objectUI = new visicomp.app.visiui.PackageUI(object,parentContainer);
			break;
			
		case "table":
			objectUI = new visicomp.app.visiui.TableUI(object,parentContainer);
			break
            
        case "function":
			objectUI = new visicomp.app.visiui.FunctionUI(object,parentContainer);
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

