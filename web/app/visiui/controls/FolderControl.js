/** This control represents a table object. */
visicomp.app.visiui.FolderControl = function(workspaceUI,folder) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,folder,visicomp.app.visiui.FolderControl.generator);
    visicomp.app.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FolderControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(visicomp.app.visiui.FolderControl,visicomp.app.visiui.ParentContainer);

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.FolderControl.prototype.writeToJson = function(json) {
    var folder = this.getObject();
    json.name = folder.getName();
    json.type = visicomp.app.visiui.FolderControl.generator.uniqueName;
	json.children = {};
    
    var workspaceUI = this.getWorkspaceUI();
	workspaceUI.addChildrenToJson(folder,json.children);
}

/** This method deseriliazes any data needed after the control is instantiated.
 * objects that extend Control should override this for any data that is
 * needed, however they should call this base function first. */
visicomp.app.visiui.FolderControl.prototype.updateFromJson = function(json,updateDataList) {
    var workspaceUI = this.getWorkspaceUI();
    
    //call the base update function
    visicomp.app.visiui.Control.updateFromJson.call(this,json,updateDataList);
    
    //load the type specific data
    if(json.children) {
        var folder = this.getObject();
        workspaceUI.createChildrenFromJson(folder,json.children,updateDataList);
    }
}

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.FolderControl.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
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
visicomp.app.visiui.FolderControl.createControl = function(workspaceUI,parent,name) {
    var returnValue = visicomp.core.createfolder.createFolder(parent,name);
    if(returnValue.success) {
        var folder = returnValue.folder;
        var folderControl = new visicomp.app.visiui.FolderControl(workspaceUI,folder);
        returnValue.control = folderControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}


//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.FolderControl.generator = {};
visicomp.app.visiui.FolderControl.generator.displayName = "Folder";
visicomp.app.visiui.FolderControl.generator.uniqueName = "visicomp.app.visiui.FolderControl";
visicomp.app.visiui.FolderControl.generator.createControl = visicomp.app.visiui.FolderControl.createControl;

