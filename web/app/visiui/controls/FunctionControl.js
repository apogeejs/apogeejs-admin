/** This control represents a table object. */
visicomp.app.visiui.FunctionControl = function(workspaceUI, functionObject, controlJson) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,functionObject,visicomp.app.visiui.FunctionControl.generator,controlJson);

    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FunctionControl,visicomp.app.visiui.Control);

//==============================
// Protected and Private Instance Methods
//==============================

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
//this stops an error message
editor.$blockScrolling = Infinity;
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode("ace/mode/javascript"); 
    this.editor = editor;
    
    //resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
    window.addListener(visicomp.visiui.WindowFrame.RESIZED, resizeCallback);
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
	if(functionObject.hasDataError()) {
        this.showError(functionObject.getDataError());
    }
    else {
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
}

visicomp.app.visiui.FunctionControl.prototype.showError = function(actionError) {
    //this.editor.style.display = "none";
    //this.errorDiv.style.display = "";
    //this.errorDiv.innerHTML = msg;
    this.editor.getSession().setValue("ERROR: " + actionError.msg);
}

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.FunctionControl.prototype.createEditArgListDialogCallback = function() {
	var instance = this;
    var member = instance.getObject();
    
    //create save handler
    var onSave = function(argList) {
        var functionBody = member.getFunctionBody();
        var supplementalCode = member.getSupplementalCode();
        var actionResponse = visicomp.core.updatemember.updateCode(member,argList,functionBody,supplementalCode);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true;  
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
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.FunctionTable.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var functionObject = actionResponse.member;
    if(functionObject) {
        var functionControl = new visicomp.app.visiui.FunctionControl(workspaceUI,functionObject);
        actionResponse.control = functionControl;
    }
    return actionResponse;
}

visicomp.app.visiui.FunctionControl.createControlFromJson = function(workspaceUI,member,controlJson) {
    var functionControl = new visicomp.app.visiui.FunctionControl(workspaceUI,member,controlJson);
    return functionControl;
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.FunctionControl.generator = {};
visicomp.app.visiui.FunctionControl.generator.displayName = "Function";
visicomp.app.visiui.FunctionControl.generator.uniqueName = "visicomp.app.visiui.FunctionControl";
visicomp.app.visiui.FunctionControl.generator.createControl = visicomp.app.visiui.FunctionControl.createControl;
visicomp.app.visiui.FunctionControl.generator.createControlFromJson = visicomp.app.visiui.FunctionControl.createControlFromJson;
visicomp.app.visiui.FunctionControl.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.FunctionControl.generator.DEFAULT_HEIGHT = 200;
 