/** This control represents a table object. */
visicomp.app.visiui.TableControl = function(table) {
    //base init
    visicomp.app.visiui.Control.init.call(this,table,visicomp.app.visiui.TableControl.generator);
    this.editor = null; //is read only, not really an editor
    
    //subscribe to table update event
    var instance = this;
    var workspace = table.getWorkspace();
    var tableUpdatedCallback = function(tableObject) {
        if(tableObject === table) {
            instance.tableUpdated();
        }
    }
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, tableUpdatedCallback);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.TableControl,visicomp.app.visiui.Control);

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.TableControl.prototype.writeToJson = function(workspaceUI, json) {
    var table = this.getObject();
    if(table.hasCode()) {
        json.functionBody = table.getFunctionBody();
        json.supplementalCode = table.getSupplementalCode();
    }
    else {
        json.data = table.getData();
    }
}

/** This method deseriliazes any data needed after the control is instantiated.
 * objects that extend Control should override this for any data that is
 * needed, however they should call this base function first. */
visicomp.app.visiui.TableControl.prototype.updateFromJson = function(workspaceUI,json,updateDataList) {
    //call the base update function
    visicomp.app.visiui.Control.updateFromJson.call(this,workspaceUI,json,updateDataList);
    
    //load the type specific data
    var updateData = {};
    updateData.member = this.getObject();
    if(json.functionBody) {
        updateData.functionBody = json.functionBody;
        updateData.supplementalCode = json.supplementalCode;
    }
    else {
        updateData.data = json.data;
    }
    updateDataList.push(updateData);
}

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.TableControl.prototype.populateFrame = function(controlFrame) {
    
    var window = controlFrame.getWindow();
    
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
    var contentDiv = controlFrame.getContentElement();
    var editor = ace.edit(contentDiv);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode("ace/mode/json"); 
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
visicomp.app.visiui.TableControl.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.TableControl.prototype.tableUpdated = function() {
    var data = this.getObject().getData();
    var textData = JSON.stringify(data,null,visicomp.app.visiui.TableControl.formatString);
    if(this.editor) {
        this.editor.getSession().setValue(textData);
    }
}

/** This method displays the edit data dialog for this control. 
 * @private */
visicomp.app.visiui.TableControl.prototype.createEditDataDialog = function() {
    var instance = this;
	
    //create save handler
    var onSave = function(data) {
        return visicomp.core.updatemember.updateData(instance.getObject(),data);
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateTableDataDialog(instance.getObject(),onSave);
    }
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.TableControl.createControl = function(workspaceUI,parent,name) {
    var returnValue = visicomp.core.createtable.createTable(parent,name);
    if(returnValue.success) {
        var table = returnValue.table;
        var tableControl = new visicomp.app.visiui.TableControl(table);
        workspaceUI.addControl(tableControl);
        returnValue.control = tableControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.TableControl.generator = {};
visicomp.app.visiui.TableControl.generator.displayName = "Table";
visicomp.app.visiui.TableControl.generator.uniqueName = "visicomp.app.visiui.TableControl";
visicomp.app.visiui.TableControl.generator.createControl = visicomp.app.visiui.TableControl.createControl;

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

