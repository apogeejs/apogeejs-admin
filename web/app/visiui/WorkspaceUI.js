/** This class manages the user interface for a workspace object. */
visicomp.app.visiui.WorkspaceUI = function(app,workspace,tab) {
    //properties
	this.app = app;
    this.tab = tab;
    this.controlMap = {};
    this.activeFolderName = null;
    this.workspace = workspace;
	
    this.jsLinkArray = [];
    this.cssLinkArray = [];
    
/////////////////////////////////////////////
var rootFolder = workspace.getRootFolder();
var controlInfo = {};
	controlInfo.object = rootFolder;
    //no ui object!!!
	
    this.controlMap[this.getObjectKey(rootFolder)] = controlInfo;

/////////////////////////////////////////////
	
    //listeners
    var instance = this;
	
	//add folder created listener
    var childDeletedListener = function(objectFullName) {
        instance.childDeleted(objectFullName);
    }
    this.workspace.addListener(visicomp.core.deletechild.CHILD_DELETED_EVENT, childDeletedListener);
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.getChildControl = function(childObject) {
    var key = this.getObjectKey(childObject);
	var controlInfo = this.controlMap[key];
	if(controlInfo) {
		return controlInfo.control;
	}
	else {
		return null;
	}
}

/** This returns the map of control objects. */
visicomp.app.visiui.WorkspaceUI.prototype.getControlMap = function() {
	return this.controlMap;
}
	
/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.addControl = function(control) {
    //make sure this is for us
    if(control.getWorkspace() !== this.workspace) return;
	
    var object = control.getObject();
	var parent = object.getParent();
    var parentControlInfo = this.controlMap[this.getObjectKey(parent)];
	var parentContainer;
	if(parentControlInfo.control) {
        //the parent control should have a content element (and should be a folder)
        //maybe we need to enforce this its the right tyep and/or add a parent component instead)
		parentContainer = parentControlInfo.control.getFrame().getContentElement();
	}
	else {
        //we will assume if there is no control is is the root
		parentContainer = this.tab;
	}
	
	//create the ui object
	var controlFrame = new visicomp.app.visiui.ControlFrame(parentContainer,object.getName());
	control.setFrame(controlFrame);
	
	//store the ui object
	var key = this.getObjectKey(object);
	
	if(this.controlMap[key]) {
		alert("Unknown error - there is already an object with this object key: " + key);
		return;
	}
	
    var controlInfo = {};
    controlInfo.object = object;
	controlInfo.control = control;
	
    this.controlMap[key] = controlInfo;
    
    //show the window
//FIGURE OUT THE RIGHT WAY TO DO THIS
	var window = controlFrame.getWindow();
	if(window) {
        var pos = this.getNextWindowPosition(parentControlInfo,parentContainer);
		window.setPosition(pos[0],pos[1]);
		window.show();
	}
}

///////////////////////////////////////////////////
//we need a better way to initialize position
//maybe we should define a parent mixin that does it.
//for now I will place it here
    
visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_X = 75;
visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_Y = 75;
visicomp.app.visiui.WorkspaceUI.MIN_WRAP_WIDTH = 20; 
visicomp.app.visiui.WorkspaceUI.MIN_WRAP_HEIGHT = 200;

/** this is used to identify if this is the root folder. */
visicomp.app.visiui.WorkspaceUI.prototype.getNextWindowPosition = function(parentControlInfo,parentContainer) {
    //initialize if needed
    if(parentControlInfo.prevNewChildX === undefined) {
        parentControlInfo.prevNewChildX = 0;
        parentControlInfo.prevNewChildY = 0;
        parentControlInfo.wrapCount = 0;
    }
    
    var x = parentControlInfo.prevNewChildX + visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_X;
    var y = parentControlInfo.prevNewChildY + visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_Y;
    
    if( ((x > parentContainer.offsetWidth)&&(x > visicomp.app.visiui.WorkspaceUI.MIN_WRAP_WIDTH)) && 
        ((y > parentContainer.offsetHeight)&&(y > visicomp.app.visiui.WorkspaceUI.MIN_WRAP_HEIGHT)) ) {
        parentControlInfo.wrapCount++;
        x = visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_X * (parentControlInfo.wrapCount + 1);
        y = visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_Y;
    }
    
    parentControlInfo.prevNewChildX = x;
    parentControlInfo.prevNewChildY = y;
    
    return [x,y];
}

///////////////////////////////////////////////////////////////////////////////////////

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.childDeleted = function(fullName) {

//we should verify the workspace!
	
	//store the ui object
	var key = fullName;
	
	var controlInfo = this.controlMap[key];
	delete this.controlMap[key];

	if((controlInfo)&&(controlInfo.control)) {
		controlInfo.control.removeFromParent();	
	}
}

visicomp.app.visiui.WorkspaceUI.prototype.getObjectKey = function(object) {
//needs to be changed when we add worksheets
	return object.getFullName();
}

visicomp.app.visiui.WorkspaceUI.prototype.toJson = function() {
    var json = {};
    json.name = this.workspace.getName();
    json.fileType = "visicomp workspace";
    
    json.jsLinks = this.jsLinkArray;
    json.cssLinks = this.cssLinkArray;
	
//we need to wait for these to load!
    
    //controls
    json.data = {};
    var rootFolder = this.workspace.getRootFolder();
	this.addChildrenToJson(rootFolder,json.data);
    
    return json;
}


/** This is used for saving the workspace. */
visicomp.app.visiui.WorkspaceUI.fromJson = function(app, json) {
    var name = json.name;
    var fileType = json.fileType;
	if((fileType !== "visicomp workspace")||(!name)) {
		return {"success":false,"msg":"Bad file format."};
	}
    
    //create the workspace
    var returnValue = app.createWorkspace(name);
    if(!returnValue.success) {
        return returnValue;
    }
    
    var workspaceUI = returnValue.workspaceUI;
	var workspace = returnValue.workspace;
    
    //add links
    var linksAdded = false;
    if((json.jsLinks)&&(json.jsLinks.length > 0)) {
        workspaceUI.setJsLinks(json.jsLinks);
        linksAdded = true;
    }
    if((json.cssLinks)&&(json.cssLinks.length > 0)) {
        workspaceUI.setCssLinks(json.cssLinks);
        linksAdded = true;
    }
	
//this is how we will wait to load links if there are any for now
if(linksAdded) {
    var timerFunction = function() {
        visicomp.app.visiui.WorkspaceUI.setWorkspaceDataFromJson(workspaceUI,workspace,json);
    }
    setTimeout(timerFunction,2000);
    return {"success":true};
}
else {
    return visicomp.app.visiui.WorkspaceUI.setWorkspaceDataFromJson(workspaceUI,workspace,json);
}
    
}

/** This is used for saving the workspace. */
visicomp.app.visiui.WorkspaceUI.setWorkspaceDataFromJson = function(workspaceUI,workspace,json) {
	
	//create children
	var rootFolder = workspace.getRootFolder();
	var childrenJson = json.data;
	var updateDataList = [];
	
	workspaceUI.createChildrenFromJson(rootFolder,childrenJson,updateDataList)
    
    //set the data on all the objects
    var result;
    if(updateDataList.length > 0) {
        result = visicomp.core.updatemember.updateObjects(updateDataList);
            
        if(!result.success) {
            return result;
        }
    }
    
//figure out a better return
	return {"success":true};
}

/** This serializes the child controls for this fodler. */
visicomp.app.visiui.WorkspaceUI.prototype.createChildrenFromJson = function(parentFolder,json,updateDataList) {
	for(var key in json) {
		var childJson = json[key];
        var type = childJson.type;
        var controlGenerator = this.app.getControlGenerator(type);
        if(!controlGenerator) {
            throw visicomp.core.util.createError("Control definition not found: " + type);
        }
        visicomp.app.visiui.Control.createfromJson(this,parentFolder,controlGenerator,childJson,updateDataList);
	}
}

/** This serializes the child controls for this fodler. */
visicomp.app.visiui.WorkspaceUI.prototype.addChildrenToJson = function(folder,json) {
	
	var childMap = folder.getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
        
		//get the object map for the workspace
		var childControl = this.getChildControl(child);
		
		//get the control for this child
		var name = child.getName();
		json[name] = childControl.toJson(this);
	}
}

//========================================
// Links
//========================================

visicomp.app.visiui.WorkspaceUI.prototype.getJsLinks = function() {
	return this.jsLinkArray;
}

visicomp.app.visiui.WorkspaceUI.prototype.setJsLinks = function(newLinkArray) {
    //update the page links
    var oldLinkArray = this.jsLinkArray;
	var addList = [];
	var removeList = [];
    this.createLinkAddRemoveList(newLinkArray,oldLinkArray,addList,removeList);
    this.jsLinkArray = newLinkArray;
	this.app.updateWorkspaceLinks(this.workspace.getName(),addList,removeList,"js");;
}

visicomp.app.visiui.WorkspaceUI.prototype.getCssLinks = function() {
	return this.cssLinkArray;
}

visicomp.app.visiui.WorkspaceUI.prototype.setCssLinks = function(newLinkArray) {
    //update the page links
    var oldLinkArray = this.cssLinkArray;
	var addList = [];
	var removeList = [];
    this.createLinkAddRemoveList(newLinkArray,oldLinkArray,addList,removeList);
    this.cssLinkArray = newLinkArray;
	this.app.updateWorkspaceLinks(this.workspace.getName(),addList,removeList,"css");
}

/** This method determins which links are new, which are old and which are removed.  
 * @private */
visicomp.app.visiui.WorkspaceUI.prototype.createLinkAddRemoveList = function(linkArray,oldLinkArray,addList,removeList) { 
    
    var newLinks = {};
    var i;
    var link;
    
    //add the new links
    for(i = 0; i < linkArray.length; i++) {
        link = linkArray[i];
        newLinks[link] = true;
    }
    
    //fiure out which are new and which are outdated
    for(i = 0; i < oldLinkArray.length; i++) {
        link = oldLinkArray[i];
        if(!newLinks[link]) {
			//this link has been removed
            removeList.push(link);
        }
		else {
			//flag that this does not need to be added
			newLinks[link] = false;
		}
    }
	
	//put the new links to the add list
	for(link in newLinks) {
		if(newLinks[link]) {
			addList.push(link);
		}
	}
}

