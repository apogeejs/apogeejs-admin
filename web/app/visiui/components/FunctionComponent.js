/** This component represents a table object. */
visicomp.app.visiui.FunctionComponent = function(workspaceUI, functionObject, componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,functionObject,visicomp.app.visiui.FunctionComponent.generator,componentJson);

    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FunctionComponent,visicomp.app.visiui.Component);

//==============================
// Protected and Private Instance Methods
//==============================

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.FunctionComponent.prototype.populateFrame = function() {
    
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
visicomp.app.visiui.FunctionComponent.prototype.onDelete = function() {
    if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.FunctionComponent.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.FunctionComponent.prototype.memberUpdated = function() {
    var functionObject = this.getObject();
    var displayName = functionObject.getDisplayName();
    
    //make sure the title is up to data
    var window = this.getWindow();
    if(window) {
        var windowTitle = window.getTitle();
        if(windowTitle != displayName) {
            window.setTitle(displayName);
        }
    }
    
    //print body
	if(functionObject.hasError()) {
        this.showErrors(functionObject.getErrors());
    }
    else {
		var functionBody = functionObject.getFunctionBody();
		var supplementalCode = functionObject.getSupplementalCode();
		var code = "function " + displayName + " {\n" + functionBody + "\n}\n";
		if(supplementalCode) {
			code += "\n/* Supplemental Code */\n\n" +
				supplementalCode;
		}
		this.editor.getSession().setValue(code);
	}
}

visicomp.app.visiui.FunctionComponent.prototype.showErrors = function(actionErrors) {
    var errorMsg = "Error: \n";
    for(var i = 0; i < actionErrors.length; i++) {
        errorMsg += actionErrors[i].msg + "\n";
    }
    this.editor.getSession().setValue(errorMsg);
}

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.FunctionComponent.prototype.createEditArgListDialogCallback = function() {
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
visicomp.app.visiui.FunctionComponent.createComponent = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.FunctionTable.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var functionObject = actionResponse.member;
    if(functionObject) {
        var functionComponent = new visicomp.app.visiui.FunctionComponent(workspaceUI,functionObject);
        actionResponse.component = functionComponent;
    }
    return actionResponse;
}

visicomp.app.visiui.FunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var functionComponent = new visicomp.app.visiui.FunctionComponent(workspaceUI,member,componentJson);
    return functionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.FunctionComponent.generator = {};
visicomp.app.visiui.FunctionComponent.generator.displayName = "Function";
visicomp.app.visiui.FunctionComponent.generator.uniqueName = "visicomp.app.visiui.FunctionComponent";
visicomp.app.visiui.FunctionComponent.generator.createComponent = visicomp.app.visiui.FunctionComponent.createComponent;
visicomp.app.visiui.FunctionComponent.generator.createComponentFromJson = visicomp.app.visiui.FunctionComponent.createComponentFromJson;
visicomp.app.visiui.FunctionComponent.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.FunctionComponent.generator.DEFAULT_HEIGHT = 200;
 