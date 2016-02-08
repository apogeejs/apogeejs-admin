/** This control represents a table object. */
visicomp.app.visiui.FolderControl = function(workspaceUI,folder,controlJson) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,folder,visicomp.app.visiui.FolderControl.generator,controlJson);
    visicomp.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
    
    //register this folder as a parent container
    workspaceUI.addControlContainer(folder,this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FolderControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(visicomp.app.visiui.FolderControl,visicomp.visiui.ParentContainer);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
visicomp.app.visiui.FolderControl.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.FolderControl.prototype.writeToJson = function(json) {
    var folder = this.getObject();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderControlContentJson(folder);
}

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.FolderControl.prototype.populateFrame = function() {
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FolderControl.createControl = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.Folder.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    if(actionResponse.success) {
        var folder = actionResponse.member;
        var folderControl = new visicomp.app.visiui.FolderControl(workspaceUI,folder);
        actionResponse.control = folderControl;
    }
    else {
        //show an error message, howver we will close dialog whether object was
		//created or not.
		visicomp.app.visiui.Control.processActionReponse(actionResponse);
    }
    return actionResponse;
}

visicomp.app.visiui.FolderControl.createControlFromJson = function(workspaceUI,member,controlJson) {
    var folderControl = new visicomp.app.visiui.FolderControl(workspaceUI,member,controlJson);
    if((controlJson)&&(controlJson.children)) {
        workspaceUI.loadFolderControlContentFromJson(member,controlJson.children);
    }
    
    return folderControl;
}


//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.FolderControl.generator = {};
visicomp.app.visiui.FolderControl.generator.displayName = "Folder";
visicomp.app.visiui.FolderControl.generator.uniqueName = "visicomp.app.visiui.FolderControl";
visicomp.app.visiui.FolderControl.generator.createControl = visicomp.app.visiui.FolderControl.createControl;
visicomp.app.visiui.FolderControl.generator.createControlFromJson = visicomp.app.visiui.FolderControl.createControlFromJson;
visicomp.app.visiui.FolderControl.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.FolderControl.generator.DEFAULT_HEIGHT = 500;