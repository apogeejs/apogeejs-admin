/** This control represents a table object. */
visicomp.app.visiui.FunctionControl = function(workspaceUI, functionObject) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,functionObject,visicomp.app.visiui.FunctionControl.generator);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FunctionControl,visicomp.app.visiui.Control);

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.FunctionControl.prototype.writeToJson = function(json) {
    var functionObject = this.getObject();
    json.argList = functionObject.getArgList();
	json.functionBody = functionObject.getFunctionBody();
	json.supplementalCode = functionObject.getSupplementalCode();
}

/** This method deseriliazes any data needed after the control is instantiated.
 * objects that extend Control should override this for any data that is
 * needed, however they should call this base function first. */
visicomp.app.visiui.FunctionControl.prototype.updateFromJson = function(json,updateDataList) {
    //call the base update function
    visicomp.app.visiui.Control.updateFromJson.call(this,json,updateDataList);
    
    //load the type specific data
    var functionObject = this.getObject();
    functionObject.setArgList(json.argList);
    
    var updateData = {};
    updateData.member = functionObject;
    updateData.functionBody = json.functionBody;
    updateData.supplementalCode = json.supplementalCode;
    updateDataList.push(updateData);
}

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.FunctionControl.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
    
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Arg&nbsp;List";
    itemInfo1.callback = this.createEditArgListDialogCallback();
  
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Function";
    itemInfo2.callback = this.createEditCodeableDialogCallback("Update Function");
    
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

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.FunctionControl.prototype.onDelete = function() {
    if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.FunctionControl.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.FunctionControl.prototype.memberUpdated = function() {
    var functionObject = this.getObject();
	var name = functionObject.getName();
    var argListString = functionObject.getArgList().join(",");
    var functionBody = functionObject.getFunctionBody();
    var supplementalCode = functionObject.getSupplementalCode();
    var code = "function " + name + "(" + argListString + ") {\n" + functionBody + "\n}\n";
	if(supplementalCode) {
		code += "\n/* Supplemental Code */\n\n" +
			supplementalCode;
	}
    this.editor.getSession().setValue(code);
}

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.FunctionControl.prototype.createEditArgListDialogCallback = function() {
	var instance = this;
    
    //create save handler
    var onSave = function(argList) {
        var editStatus = visicomp.core.updatemember.updateArgList(instance.object,argList);
        var editComplete = instance.processEditResult(editStatus);
        return editComplete;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateArgListDialog(instance.object,onSave);
    }
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FunctionControl.createControl = function(workspaceUI,parent,name) {
	
    var initialArgList = [];
    var returnValue = visicomp.core.createfunction.createFunction(parent,name,initialArgList);
    if(returnValue.success) {
        var functionObject = returnValue.functionObject;
        var functionControl = new visicomp.app.visiui.FunctionControl(workspaceUI,functionObject);
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

visicomp.app.visiui.FunctionControl.generator = {};
visicomp.app.visiui.FunctionControl.generator.displayName = "Function";
visicomp.app.visiui.FunctionControl.generator.uniqueName = "visicomp.app.visiui.FunctionControl";
visicomp.app.visiui.FunctionControl.generator.createControl = visicomp.app.visiui.FunctionControl.createControl;

 