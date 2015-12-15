/** This control represents a table object. */
visicomp.app.visiui.FunctionControl = function(functionObject) {
    this.functionObject = functionObject;
    this.editor = null; //is read only, not really an editor
    this.frame = null;
    
    //subscribe to table update event
    var instance = this;
    var workspace = functionObject.getWorkspace();
    var functionUpdatedCallback = function(functionObject) {
        if(functionObject === instance.functionObject) {
            instance.functionUpdated();
        }
    }
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, functionUpdatedCallback);
};


//==============================
// Public Instance Methods
//==============================

/** This method returns the table for this function control. */
visicomp.app.visiui.FunctionControl.prototype.getObject = function() {
    return this.functionObject;
}

/** This method returns the table for this function control. */
visicomp.app.visiui.FunctionControl.prototype.getWorkspace = function() {
    return this.functionObject.getWorkspace();
}

/** This method populates the frame for this control. */
visicomp.app.visiui.FunctionControl.prototype.getFrame = function() {
     return this.frame;
}

/** This method populates the frame for this control. */
visicomp.app.visiui.FunctionControl.prototype.setFrame = function(controlFrame) {
    
    this.frame = controlFrame;
    
    //editor - only for display, read only
    var contentDiv = controlFrame.getContentElement();
    var editor = ace.edit(contentDiv);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode("ace/mode/json"); 
    this.editor = editor;
    
    var window = controlFrame.getWindow();
    
    //resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
    window.addListener("resize", resizeCallback);
    
    //menus
    var instance = this;
    
    //create the edit button
	var editCodeButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit Code"});
    editCodeButton.onclick = function() {
        instance.createEditCodeDialog();
    }
    window.addTitleBarElement(editCodeButton);

    //dummy size
window.setSize(200,200);

}

/** This serializes the table control. */
visicomp.app.visiui.TableControl.prototype.toJson = function() {
    var json = {};
    json.name = this.table.getName();
    json.type = visicomp.app.visiui.FunctionControl.generator.name;
	json.functionBody = this.functionObject.getFunctionBody();
	json.supplementalCode = this.functionObject.getSupplementalCode();
    return json;
}

//==============================
// Private Instance Methods
//==============================

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.FunctionControl.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.FunctionControl.prototype.functionUpdated = function() {
	var name = this.functionObject.getName();
    var argParens = this.functionObject.getArgParensList();
    var functionBody = this.functionObject.getFunctionBody();
    var supplementalCode = this.functionObject.getSupplementalCode();
    var code = "function " + name + argParens + " {\n" + functionBody + "\n}\n";
	if(supplementalCode) {
		code += "\n/* Supplemental Code */\n\n" +
			supplementalCode;
	}
    this.editor.getSession().setValue(code);
}

/** This method displays the edit code dialog
 *  @private */
visicomp.app.visiui.FunctionControl.prototype.createEditCodeDialog = function() {
	var instance = this;
    
    //create save handler
    var onSave = function(functionBody,supplementalCode) {
        return visicomp.core.updatemember.updateCode(instance.functionObject,functionBody,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateCodeableDialog(this.functionObject,onSave,"Update Function");
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FunctionControl.showCreateDialog = function(app) {
     visicomp.app.visiui.dialog.showCreateChildDialog("Function",
        app,
        visicomp.app.visiui.FunctionControl.createFunctionControl
    );
}

//add table listener
visicomp.app.visiui.FunctionControl.createFunctionControl = function(app,parent,declarationName) {
	
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
        updateData.member = resultValue.function;
		updateData.functionBody = json.functionBody;
		updateData.supplementalCode = json.supplementalCode;
        updateDataList.push(updateData);
    }
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.FunctionControl.generator = {};
visicomp.app.visiui.FunctionControl.generator.name = "Function";
visicomp.app.visiui.FunctionControl.generator.showCreateDialog = visicomp.app.visiui.FunctionControl.showCreateDialog;
visicomp.app.visiui.FunctionControl.generator.createFromJson = visicomp.app.visiui.FunctionControl.createfromJson;

 