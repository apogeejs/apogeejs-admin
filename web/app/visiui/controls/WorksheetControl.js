/** This control represents a table object. */
visicomp.app.visiui.WorksheetControl = function(workspaceUI,worksheet) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,worksheet,visicomp.app.visiui.WorksheetControl.generator);
    visicomp.app.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
    
        //register this object as a parent container
    var internalFolder = worksheet.getInternalFolder();
    workspaceUI.registerControl(internalFolder,null);
    workspaceUI.addControlContainer(internalFolder,this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.WorksheetControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(visicomp.app.visiui.WorksheetControl,visicomp.app.visiui.ParentContainer);

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the worksheet control. */
visicomp.app.visiui.WorksheetControl.prototype.writeToJson = function(json) {
    var worksheet = this.getObject();
    json.name = worksheet.getName();
    json.type = visicomp.app.visiui.WorksheetControl.generator.uniqueName;
    
    var workspaceUI = this.getWorkspaceUI();
    
	json.internalFolder = {};
    var internalFolder = worksheet.getInternalFolder();
	workspaceUI.addChildrenToJson(internalFolder,json.internalFolder);

    json.externalFolder = {};
    var externalFolder = worksheet.getExternalFolder();
	workspaceUI.addChildrenToJson(externalFolder,json.externalFolder);

}

/** This method deseriliazes any data needed after the control is instantiated.
 * objects that extend Control should override this for any data that is
 * needed, however they should call this base function first. */
visicomp.app.visiui.WorksheetControl.prototype.updateFromJson = function(json,updateDataList) {
    var workspaceUI = this.getWorkspaceUI();
    
    //call the base update function
    visicomp.app.visiui.Control.updateFromJson.call(this,json,updateDataList);
    
    //internal data
    var worksheet = this.getObject();
    if(json.internalFolder) {
        var internalFolder = worksheet.getInternalFolder();
        workspaceUI.createChildrenFromJson(internalFolder,json.internalFolder,updateDataList);
    }
    
    if(json.externalFolder) {
        var externalFolder = worksheet.getExternalFolder();
        workspaceUI.createChildrenFromJson(externalFolder,json.externalFolder,updateDataList);
    }
}

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.WorksheetControl.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
    var menuItemInfoList = this.getMenuItemInfoList();
    
    //there should be one item - the delete item. Remove it because delete is not currently correct
    menuItemInfoList.pop();
    
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
visicomp.app.visiui.WorksheetControl.createControl = function(workspaceUI,parent,name) {
    var returnValue = visicomp.core.createworksheet.createWorksheet(parent,name);
    if(returnValue.success) {
        var worksheet = returnValue.worksheet;
        var worksheetControl = new visicomp.app.visiui.WorksheetControl(workspaceUI,worksheet);
        returnValue.control = worksheetControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}


//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.WorksheetControl.generator = {};
visicomp.app.visiui.WorksheetControl.generator.displayName = "Worksheet";
visicomp.app.visiui.WorksheetControl.generator.uniqueName = "visicomp.app.visiui.WorksheetControl";
visicomp.app.visiui.WorksheetControl.generator.createControl = visicomp.app.visiui.WorksheetControl.createControl;

