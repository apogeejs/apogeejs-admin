/** This control represents a table object. */
visicomp.app.visiui.WorksheetControl = function(workspaceUI,worksheet) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,worksheet,visicomp.app.visiui.WorksheetControl.generator);
    visicomp.app.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
    
    //register this object as a parent container
    var internalFolder = worksheet.getInternalFolder();
    workspaceUI.registerMember(internalFolder,null);
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
    var internalFolder = worksheet.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderControlContentJson(internalFolder);
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
    
    worksheet.setArgList(json.argList);
    worksheet.setReturnValueString(json.returnValueString);
    
    if(json.internalFolder) {
        var internalFolder = worksheet.getInternalFolder();
        workspaceUI.createChildrenFromJson(internalFolder,json.internalFolder,updateDataList);
    }
    
}

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.WorksheetControl.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
    var menuItemInfoList = this.getMenuItemInfoList();
    
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Arg&nbsp;List";
    itemInfo1.callback = this.createEditArgListDialogCallback();
  
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Return&nbspValue";
    itemInfo2.callback = this.createEditReturnValueDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2);
    
//    //resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
//    window.addListener("resize", resizeCallback);

    //dummy size
window.setSize(500,500);

}

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.WorksheetControl.prototype.createEditArgListDialogCallback = function() {
    var worksheet = this.getObject();
    
    //create save handler
    var onSave = function(argList) {
        worksheet.setArgList(argList);
        
        var editComplete = true;
        return editComplete;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateArgListDialog(worksheet,onSave);
    }
}

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.WorksheetControl.prototype.createEditReturnValueDialogCallback = function() {
    var worksheet = this.getObject();
    
    //create save handler
    var onSave = function(returnValueString) {
        
        worksheet.setReturnValueString(returnValueString);
        
        var editComplete = true;       
        return editComplete;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateWorksheetReturnDialog(worksheet,onSave);
    }
}

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.WorksheetControl.prototype.memberUpdated = function() {
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.WorksheetControl.createControl = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.Worksheet.generator.type;
    var returnValue = visicomp.core.createmember.createMember(parent,json);
    
    if(returnValue.success) {
        var worksheet = returnValue.member;
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

