/** This control represents a table object. */
visicomp.app.visiui.FunctionControl = function(functionObject) {
    //base init
    visicomp.app.visiui.Control.init.call(this,functionObject,"Function");
    this.editor = null; //is read only, not really an editor
    
    //subscribe to table update event
    var instance = this;
    var workspace = functionObject.getWorkspace();
    var functionUpdatedCallback = function(updatedObject) {
        if(updatedObject === functionObject) {
            instance.functionUpdated();
        }
    }
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, functionUpdatedCallback);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FunctionControl,visicomp.app.visiui.Control);

//==============================
// Public Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.TableControl.prototype.toJson = function(workspaceUI) {
    var json = {};
    json.name = this.table.getName();
    json.type = visicomp.app.visiui.FunctionControl.generator.uniqueName;
	json.functionBody = this.functionObject.getFunctionBody();
	json.supplementalCode = this.functionObject.getSupplementalCode();
    return json;
}

//==============================
// Protected and Private Instance Methods
//==============================


/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.FunctionControl.prototype.populateFrame = function(controlFrame) {
    
    var window = controlFrame.getWindow();
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo = {};
    itemInfo.title = "Edit&nbsp;Function";
    itemInfo.callback = this.createEditCodeableDialogCallback("Update Function");
    
    //add these at the start of the menu
    menuItemInfoList.splice(0,0,itemInfo);
    
    //editor - only for display, read only
    var contentDiv = controlFrame.getContentElement();
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

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.FunctionControl.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.FunctionControl.prototype.functionUpdated = function() {
    var functionObject = this.getObject();
	var name = functionObject.getName();
    var argParens = functionObject.getArgParensList();
    var functionBody = functionObject.getFunctionBody();
    var supplementalCode = functionObject.getSupplementalCode();
    var code = "function " + name + argParens + " {\n" + functionBody + "\n}\n";
	if(supplementalCode) {
		code += "\n/* Supplemental Code */\n\n" +
			supplementalCode;
	}
    this.editor.getSession().setValue(code);
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FunctionControl.getShowCreateDialogCallback = function(app) {
    return function() {
        visicomp.app.visiui.dialog.showCreateChildDialog("Function",
            app,
            visicomp.app.visiui.FunctionControl.createControl
        );
    }
}

//add table listener
visicomp.app.visiui.FunctionControl.createControl = function(app,parent,declarationName) {
	
	//clean up extraction of name and arg list---------------
	var nameLength = declarationName.indexOf("(");
	if(nameLength < 0) {
		alert("Include the argument list with the name.");
		return {"success":false};
	}
	var functionName = declarationName.substr(0,nameLength);
    var argParens = declarationName.substr(nameLength);
	//--------------------------------------------------------
	
    var returnValue = visicomp.core.createfunction.createFunction(parent,functionName,argParens);
    if(returnValue.success) {
        var functionObject = returnValue.functionObject;
        var functionControl = new visicomp.app.visiui.FunctionControl(functionObject);
        app.addControl(functionControl);
    }
    else {
        //no action for now
    }
    return returnValue;
}

/** This serializes the table control. */
visicomp.app.visiui.FunctionControl.createfromJson = function(app,parent,json,updateDataList) {

    var name = json.name;
    var resultValue = visicomp.app.visiui.FunctionControl.createFunctionControl(app,parent,name);
    
    if(resultValue.success) {
        var updateData = {};
        updateData.member = resultValue.functionObject;
		updateData.functionBody = json.functionBody;
		updateData.supplementalCode = json.supplementalCode;
        updateDataList.push(updateData);
    }
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.FunctionControl.generator = {};
visicomp.app.visiui.FunctionControl.generator.displayName = "Function";
visicomp.app.visiui.FunctionControl.generator.uniqueName = "visicomp.app.visiui.FunctionControl";
visicomp.app.visiui.FunctionControl.generator.getShowCreateDialogCallback = visicomp.app.visiui.FunctionControl.getShowCreateDialogCallback;
visicomp.app.visiui.FunctionControl.generator.createFromJson = visicomp.app.visiui.FunctionControl.createfromJson;

 