/** This control represents a table object. */
visicomp.app.visiui.WorksheetControl = function(workspaceUI,worksheet,controlJson) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,worksheet,visicomp.app.visiui.WorksheetControl.generator,controlJson);
    visicomp.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
    
    //register this object as a parent container
    var internalFolder = worksheet.getInternalFolder();
    workspaceUI.registerMember(internalFolder,null);
    workspaceUI.addControlContainer(internalFolder,this);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.WorksheetControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(visicomp.app.visiui.WorksheetControl,visicomp.visiui.ParentContainer);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
visicomp.app.visiui.WorksheetControl.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

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

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.WorksheetControl.prototype.populateFrame = function() {
    
    var menuItemInfoList = this.getMenuItemInfoList();
    
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Arg&nbsp;List";
    itemInfo1.callback = this.createEditArgListDialogCallback();
  
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Return&nbspValue";
    itemInfo2.callback = this.createEditReturnValueDialogCallback();
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2);
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

visicomp.app.visiui.WorksheetControl.createControlFromJson = function(workspaceUI,member,controlJson) {
    var worksheetControl = new visicomp.app.visiui.WorksheetControl(workspaceUI,member,controlJson);
    if((controlJson)&&(controlJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderControlContentFromJson(folder,controlData.children);
    }
    return worksheetControl;
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.WorksheetControl.generator = {};
visicomp.app.visiui.WorksheetControl.generator.displayName = "Worksheet";
visicomp.app.visiui.WorksheetControl.generator.uniqueName = "visicomp.app.visiui.WorksheetControl";
visicomp.app.visiui.WorksheetControl.generator.createControl = visicomp.app.visiui.WorksheetControl.createControl;
visicomp.app.visiui.WorksheetControl.generator.createControlFromJson = visicomp.app.visiui.WorksheetControl.createControlFromJson;
visicomp.app.visiui.WorksheetControl.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.WorksheetControl.generator.DEFAULT_HEIGHT = 500;
