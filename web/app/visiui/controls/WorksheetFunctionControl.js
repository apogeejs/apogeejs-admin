/** This control represents a table object. */
visicomp.app.visiui.WorksheetFunctionControl = function(workspaceUI, functionObject) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,functionObject,visicomp.app.visiui.WorksheetFunctionControl.generator);

    this.returnValue = "returnValue";
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.WorksheetFunctionControl,visicomp.app.visiui.Control);

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.WorksheetFunctionControl.prototype.writeToJson = function(json) {
    var functionObject = this.getObject();
    json.argList = functionObject.getArgList();
	json.returnValue = this.returnValue;
}

/** This method deseriliazes any data needed after the control is instantiated.
 * objects that extend Control should override this for any data that is
 * needed, however they should call this base function first. */
visicomp.app.visiui.WorksheetFunctionControl.prototype.updateFromJson = function(json,updateDataList) {
    //call the base update function
    visicomp.app.visiui.Control.updateFromJson.call(this,json,updateDataList);
    
    //load the type specific data
    var functionObject = this.getObject();
    functionObject.setArgList(json.argList);
    
    this.returnValue = json.returnValue;
}

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.WorksheetFunctionControl.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
    
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Arg&nbsp;List";
    itemInfo1.callback = this.createEditArgListDialogCallback();
  
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Function";
    itemInfo2.callback = this.createEditReturnValueDialogCallback("Update Worksheet Function");
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo1,itemInfo2);
    
    //editor - only for display, read only
    var contentDiv = this.getContentElement();
    var editor = ace.edit(contentDiv);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode("ace/mode/javascript"); 
    this.editor = editor;
    
    //resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
    window.addListener("resize", resizeCallback);

    //dummy size
window.setSize(200,200);

}

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.Control.prototype.createEditReturnValueDialogCallback = function() {
	var instance = this;
    
    //create save handler
    var onSave = function(argList) {
        this.argList = argList;
        //need to compute and set the function!!
        //var editStatus = visicomp.core.updatemember.updateReturnValue(instance.object,argList);
        //var editComplete = instance.processEditResult(editStatus);
var editComplete = true;       
        return editComplete;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateReturnValueDialog(instance.object,onSave);
    }
}

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.WorksheetFunctionControl.prototype.onDelete = function() {
    if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.WorksheetFunctionControl.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.WorksheetFunctionControl.prototype.memberUpdated = function() {
    var functionObject = this.getObject();
	var name = functionObject.getName();
    var argListString = functionObject.getArgList().join(",");
    var code = this.returnValue + " = function " + name + "(" + argListString + ");";
    this.editor.getSession().setValue(code);
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.WorksheetFunctionControl.createControl = function(workspaceUI,parent,name) {
	
    var initialArgList = [];
    var returnValue = visicomp.core.createfunction.createFunction(parent,name,initialArgList);
    if(returnValue.success) {
        var functionObject = returnValue.functionObject;
        var functionControl = new visicomp.app.visiui.WorksheetFunctionControl(workspaceUI,functionObject);
        returnValue.control = functionControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.WorksheetFunctionControl.generator = {};
visicomp.app.visiui.WorksheetFunctionControl.generator.displayName = "Function";
visicomp.app.visiui.WorksheetFunctionControl.generator.uniqueName = "visicomp.app.visiui.WorksheetFunctionControl";
visicomp.app.visiui.WorksheetFunctionControl.generator.createControl = visicomp.app.visiui.WorksheetFunctionControl.createControl;

 