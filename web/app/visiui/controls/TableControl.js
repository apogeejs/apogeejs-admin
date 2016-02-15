/** This control represents a json table object. */
visicomp.app.visiui.JsonTableControl = function(workspaceUI,table,controlJson) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,table,visicomp.app.visiui.JsonTableControl.generator,controlJson);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.JsonTableControl,visicomp.app.visiui.Control);

//==============================
// Protected and Private Instance Methods
//==============================

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.JsonTableControl.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Data";
    itemInfo1.callback = this.createEditDataDialog();
    
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Formula";
    itemInfo2.callback = this.createEditCodeableDialogCallback(itemInfo2.title,visicomp.app.visiui.JsonTableControl.editorCodeWrapper);
    
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
    editor.getSession().setMode("ace/mode/json"); 
    this.editor = editor;
    
    //resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
    window.addListener(visicomp.visiui.WindowFrame.RESIZED, resizeCallback);
}

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.JsonTableControl.prototype.onDelete = function() {
    if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.JsonTableControl.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.JsonTableControl.prototype.memberUpdated = function() {
    var object = this.getObject();
    if(object.hasDataError()) {
        this.showError(object.getDataError());
    }
    else {
        var data = this.getObject().getData();
        var textData;
        if(data === null) {
            textData = "null";
        }
        else if(data === undefined) {
            textData = "undefined";
        }
        else {
            textData = JSON.stringify(data,null,visicomp.app.visiui.JsonTableControl.formatString);
        }
        this.showData(textData);
    }
}

visicomp.app.visiui.JsonTableControl.prototype.showError = function(actionError) {
    //this.editor.style.display = "none";
    //this.errorDiv.style.display = "";
    //this.errorDiv.innerHTML = msg;
    this.editor.getSession().setValue("ERROR: " + actionError.msg);
}

visicomp.app.visiui.JsonTableControl.prototype.showData = function(dataText) {
    //this.editor.style.display = "";
    //this.errorDiv.style.display = "none";
    this.editor.getSession().setValue(dataText);
}

//=============================
// Action UI Entry Points
//=============================

/** This method displays the edit data dialog for this control. 
 * @private */
visicomp.app.visiui.JsonTableControl.prototype.createEditDataDialog = function() {
    var instance = this;
	
    //create save handler
    var onSave = function(data) {
        var actionResponse = visicomp.core.updatemember.updateData(instance.getObject(),data);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateTableDataDialog(instance.getObject(),onSave);
    }
}

//======================================
// Static methods
//======================================


visicomp.app.visiui.JsonTableControl.createControl = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.TableControl.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableControl = new visicomp.app.visiui.JsonTableControl(workspaceUI,table);
        actionResponse.control = tableControl;
    }
    return actionResponse;
}


visicomp.app.visiui.JsonTableControl.createControlFromJson = function(workspaceUI,member,controlJson) {
    var tableControl = new visicomp.app.visiui.JsonTableControl(workspaceUI,member,controlJson);
    return tableControl;
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.JsonTableControl.generator = {};
visicomp.app.visiui.JsonTableControl.generator.displayName = "JSON Table";
visicomp.app.visiui.JsonTableControl.generator.uniqueName = "visicomp.app.visiui.JsonTableControl";
visicomp.app.visiui.JsonTableControl.generator.createControl = visicomp.app.visiui.JsonTableControl.createControl;
visicomp.app.visiui.JsonTableControl.generator.createControlFromJson = visicomp.app.visiui.JsonTableControl.createControlFromJson;
visicomp.app.visiui.JsonTableControl.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.JsonTableControl.generator.DEFAULT_HEIGHT = 200;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

visicomp.app.visiui.JsonTableControl.editorCodeWrapper = {};

visicomp.app.visiui.JsonTableControl.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
visicomp.app.visiui.JsonTableControl.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.app.visiui.JsonTableControl.editorCodeWrapper.displayName = "Formula";

visicomp.app.visiui.JsonTableControl.editorCodeWrapper.wrapCode = function(formula) { 
    return visicomp.app.visiui.JsonTableControl.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        visicomp.app.visiui.JsonTableControl.editorCodeWrapper.FUNCTION_SUFFIX;
}

visicomp.app.visiui.JsonTableControl.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}

