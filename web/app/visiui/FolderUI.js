/** This control represents a table object. */
visicomp.app.visiui.FolderControl = function(folder) {
    this.folder = folder;
    this.frame = null;
};

//==============================
// Public Instance Methods
//==============================

/** This method returns the table for this table control. */
visicomp.app.visiui.FolderControl.prototype.getObject = function() {
    return this.folder;
}

/** This method returns the table for this table control. */
visicomp.app.visiui.FolderControl.prototype.getWorkspace = function() {
    return this.folder.getWorkspace();
}

/** This method populates the frame for this control. */
visicomp.app.visiui.FolderControl.prototype.getFrame = function() {
     return this.frame;
}

/** This method populates the frame for this control. */
visicomp.app.visiui.FolderControl.prototype.setFrame = function(controlFrame) {
    
    this.frame = controlFrame;
    
    var window = controlFrame.getWindow();
    
//    //resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
//    window.addListener("resize", resizeCallback);

    //dummy size
window.setSize(500,500);

}

/** This serializes the table control. */
visicomp.app.visiui.FolderControl.prototype.toJson = function(workspaceUI) {
	
//NEEDS TO BE FIXED!!!!	
	
    var json = {};
    json.name = this.table.getName();
    json.type = visicomp.app.visiui.FolderControl.generator.name;
	json.children = {};
	this.addChildrenToJson(workspaceUI,json.children);
    return json;
}

/** This serializes the child controls for this fodler. */
visicomp.app.visiui.FolderControl.prototype.addChildrenToJson = function(workspaceUI,json) {
	
	var childMap = this.folder.getChildMap();
	for(var key in childMap) {
		var child = json[key];
        
		//get the object map for the workspace
		var childControl = workspaceUI.lookupChildControl(child);
		
		//get the control for this child
		var name = child.getName();
		json[name] = childControl.toJson(workspaceUI);
	}
}

//==============================
// Private Instance Methods
//==============================


//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FolderControl.showCreateDialog = function(app) {
     visicomp.app.visiui.dialog.showCreateChildDialog("Folder",
        app,
        visicomp.app.visiui.FolderControl.createFolderControl
    );
}

//add table listener
visicomp.app.visiui.FolderControl.createFolderControl = function(app,parent,folderName) {
    var returnValue = visicomp.core.createfolder.createFolder(parent,folderName);
    if(returnValue.success) {
        var folder = returnValue.folder;
        var folderControl = new visicomp.app.visiui.FolderControl(folder);
        app.addControl(folderControl);
    }
    else {
        //no action for now
    }
    return returnValue;
}

/** This serializes the table control. */
visicomp.app.visiui.FolderControl.createfromJson = function(app,parent,json,updateDataList) {
    var name = json.name;
    var resultValue = visicomp.app.visiui.FolderControl.createFolderControl(app,parent,name);
	if(resultValue.success) {
		if(json.children) {
			var folder = resultValue.folder;
			folder.createChildrenFromJson(json.children);
		}
	}
}

/** This serializes the child controls for this fodler. */
visicomp.app.visiui.FolderControl.prototype.createChildrenFromJson = function(app,json,updateDataList) {
	for(var key in json) {
		var childJson = json[key];
        var type = childJson.type;
        var controlGenerator = app.getControlGenerator(type);
        if(!controlGenerator) {
            throw visicomp.core.util.createError("Control definition not found: " + type);
        }
        controlGenerator.createFromJson(app,this,childJson,updateDataList)
	}
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.FolderControl.generator = {};
visicomp.app.visiui.FolderControl.generator.name = "Folder";
visicomp.app.visiui.FolderControl.generator.showCreateDialog = visicomp.app.visiui.FolderControl.showCreateDialog;
visicomp.app.visiui.FolderControl.generator.createFromJson = visicomp.app.visiui.FolderControl.createfromJson;

