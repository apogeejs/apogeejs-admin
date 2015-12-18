/** This control represents a table object. */
visicomp.app.visiui.FolderControl = function(folder) {
    //base init
    visicomp.app.visiui.Control.init.call(this,folder,"Folder");
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FolderControl,visicomp.app.visiui.Control);

//==============================
// Public Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.FolderControl.prototype.toJson = function(workspaceUI) {
	
    var json = {};
    var folder = this.getObject();
    json.name = folder.getName();
    json.type = visicomp.app.visiui.FolderControl.generator.uniqueName;
	json.children = {};
    
	workspaceUI.addChildrenToJson(folder,json.children);
    
    return json;
}

//==============================
// Protected and Private Instance Methods
//==============================


/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.FolderControl.prototype.populateFrame = function(controlFrame) {
    
    var window = controlFrame.getWindow();
    
//    //resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
//    window.addListener("resize", resizeCallback);

    //dummy size
window.setSize(500,500);

}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FolderControl.getShowCreateDialogCallback = function(app) {
    return function() {
       visicomp.app.visiui.dialog.showCreateChildDialog("Folder",
           app,
           visicomp.app.visiui.FolderControl.createControl
       );
    }
}

//add table listener
visicomp.app.visiui.FolderControl.createControl = function(workspaceUI,parent,name) {
    var returnValue = visicomp.core.createfolder.createFolder(parent,name);
    if(returnValue.success) {
        var folder = returnValue.folder;
        var folderControl = new visicomp.app.visiui.FolderControl(folder);
        workspaceUI.addControl(folderControl);
    }
    else {
        //no action for now
    }
    return returnValue;
}

/** This serializes the table control. */
visicomp.app.visiui.FolderControl.createfromJson = function(workspaceUI,parent,json,updateDataList) {
    var name = json.name;
    var resultValue = visicomp.app.visiui.FolderControl.createControl(workspaceUI,parent,name);
	if(resultValue.success) {
		if(json.children) {
			var folder = resultValue.folder;
			workspaceUI.createChildrenFromJson(folder,json.children,updateDataList);
		}
	}
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.FolderControl.generator = {};
visicomp.app.visiui.FolderControl.generator.displayName = "Folder";
visicomp.app.visiui.FolderControl.generator.uniqueName = "visicomp.app.visiui.FolderControl";
visicomp.app.visiui.FolderControl.generator.getShowCreateDialogCallback = visicomp.app.visiui.FolderControl.getShowCreateDialogCallback;
visicomp.app.visiui.FolderControl.generator.createFromJson = visicomp.app.visiui.FolderControl.createfromJson;

