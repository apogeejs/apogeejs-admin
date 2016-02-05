/** This control represents a table object. */
visicomp.app.visiui.TableControl = function(workspaceUI,table,controlJson) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,table,visicomp.app.visiui.TableControl.generator,controlJson);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.TableControl,visicomp.app.visiui.Control);

//==============================
// Protected and Private Instance Methods
//==============================

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.TableControl.prototype.populateFrame = function() {
    
    var window = this.getWindow();
    
    //create the menu
    var menuItemInfoList = this.getMenuItemInfoList();
  
    var itemInfo1 = {};
    itemInfo1.title = "Edit&nbsp;Data";
    itemInfo1.callback = this.createEditDataDialog();
    
    var itemInfo2 = {};
    itemInfo2.title = "Edit&nbsp;Formula";
    itemInfo2.callback = this.createEditCodeableDialogCallback(itemInfo2.title,visicomp.app.visiui.TableControl.editorCodeWrapper);
    
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
visicomp.app.visiui.TableControl.prototype.onDelete = function() {
    if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.TableControl.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.TableControl.prototype.memberUpdated = function() {
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
            textData = JSON.stringify(data,null,visicomp.app.visiui.TableControl.formatString);
        }
        this.showData(textData);
    }
}

visicomp.app.visiui.TableControl.prototype.showError = function(actionError) {
    //this.editor.style.display = "none";
    //this.errorDiv.style.display = "";
    //this.errorDiv.innerHTML = msg;
    this.editor.getSession().setValue("ERROR: " + actionError.msg);
}

visicomp.app.visiui.TableControl.prototype.showData = function(dataText) {
    //this.editor.style.display = "";
    //this.errorDiv.style.display = "none";
    this.editor.getSession().setValue(dataText);
}

/** This method displays the edit data dialog for this control. 
 * @private */
visicomp.app.visiui.TableControl.prototype.createEditDataDialog = function() {
    var instance = this;
	
    //create save handler
    var onSave = function(data) {
        var actionResponse = visicomp.core.updatemember.updateData(instance.getObject(),data);
        var closeDialog = instance.processActionReponse(actionResponse);
        return closeDialog;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateTableDataDialog(instance.getObject(),onSave);
    }
}

//======================================
// Static methods
//======================================


visicomp.app.visiui.TableControl.createControl = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.Table.generator.type;
    var returnValue = visicomp.core.createmember.createMember(parent,json);
    
    if(returnValue.success) {
        var table = returnValue.member;
        var tableControl = new visicomp.app.visiui.TableControl(workspaceUI,table);
        returnValue.control = tableControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}


visicomp.app.visiui.TableControl.createControlFromJson = function(workspaceUI,member,controlJson) {
    var tableControl = new visicomp.app.visiui.TableControl(workspaceUI,member,controlJson);
    return tableControl;
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.TableControl.generator = {};
visicomp.app.visiui.TableControl.generator.displayName = "Table";
visicomp.app.visiui.TableControl.generator.uniqueName = "visicomp.app.visiui.TableControl";
visicomp.app.visiui.TableControl.generator.createControl = visicomp.app.visiui.TableControl.createControl;
visicomp.app.visiui.TableControl.generator.createControlFromJson = visicomp.app.visiui.TableControl.createControlFromJson;
visicomp.app.visiui.TableControl.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.TableControl.generator.DEFAULT_HEIGHT = 200;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

visicomp.app.visiui.TableControl.editorCodeWrapper = {};

visicomp.app.visiui.TableControl.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
visicomp.app.visiui.TableControl.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.app.visiui.TableControl.editorCodeWrapper.displayName = "Formula";

visicomp.app.visiui.TableControl.editorCodeWrapper.wrapCode = function(formula) { 
    return visicomp.app.visiui.TableControl.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        visicomp.app.visiui.TableControl.editorCodeWrapper.FUNCTION_SUFFIX;
}

visicomp.app.visiui.TableControl.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}

