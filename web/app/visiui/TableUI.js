/** This control represents a table object. */
visicomp.app.visiui.TableControl = function(table) {
    this.table = table;
    this.editor = null; //is read only, not really an editor
    this.frame = null;
    
    //subscribe to table update event
    var instance = this;
    var workspace = table.getWorkspace();
    var tableUpdatedCallback = function(tableObject) {
        if(tableObject === instance.table) {
            instance.tableUpdated();
        }
    }
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, tableUpdatedCallback);
};

//==============================
// Public Instance Methods
//==============================

/** This method returns the table for this table control. */
visicomp.app.visiui.TableControl.prototype.getObject = function() {
    return this.table;
}

/** This method returns the table for this table control. */
visicomp.app.visiui.TableControl.prototype.getWorkspace = function() {
    return this.table.getWorkspace();
}

/** This method populates the frame for this control. */
visicomp.app.visiui.TableControl.prototype.getFrame = function() {
     return this.frame;
}

/** This method populates the frame for this control. */
visicomp.app.visiui.TableControl.prototype.setFrame = function(controlFrame) {
    
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
    var editDataButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit Data"});
    editDataButton.onclick = function() {
        instance.createEditDataDialog();
    }
    window.addTitleBarElement(editDataButton);
    
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
    json.type = visicomp.app.visiui.TableControl.generator.name;
    
    if(this.table.hasCode()) {
        json.functionBody = this.table.getFunctionBody();
        json.supplementalCode = this.table.getSupplementalCode();
    }
    else {
        json.data = this.table.getData();
    }
    return json;
}

//==============================
// Private Instance Methods
//==============================

/** This is the format character use to display tabs in the display editor. 
 * @private*/
visicomp.app.visiui.TableControl.formatString = "\t";

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.TableControl.prototype.tableUpdated = function() {
    var textData = JSON.stringify(this.table.getData(),null,visicomp.app.visiui.TableControl.formatString);
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
        return visicomp.core.updatemember.updateData(instance.table,data);
    };
    
    visicomp.app.visiui.dialog.showUpdateTableDataDialog(this.table,onSave);
}

/** This method displays the edit code dialog
 *  @private */
visicomp.app.visiui.TableControl.prototype.createEditCodeDialog = function() {
	var instance = this;
    
    //create save handler
    var onSave = function(functionBody,supplementalCode) {
        return visicomp.core.updatemember.updateCode(instance.table,functionBody,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateCodeableDialog(this.table,onSave,"Update Table",visicomp.app.visiui.TableControl.editorCodeWrapper);
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.TableControl.showCreateDialog = function(app) {
     visicomp.app.visiui.dialog.showCreateChildDialog("Table",
        app,
        visicomp.app.visiui.TableControl.createTableControl
    );
}

//add table listener
visicomp.app.visiui.TableControl.createTableControl = function(app,parent,tableName) {
    var returnValue = visicomp.core.createtable.createTable(parent,tableName);
    if(returnValue.success) {
        var table = returnValue.table;
        var tableControl = new visicomp.app.visiui.TableControl(table);
        app.addControl(tableControl);
    }
    else {
        //no action for now
    }
    return returnValue;
}

/** This serializes the table control. */
visicomp.app.visiui.TableControl.createfromJson = function(app,parent,json,updateDataList) {

    var name = json.name;
    var resultValue = visicomp.app.visiui.TableControl.createTableControl(app,parent,name);
    
    if(resultValue.success) {
        var updateData = {};
        updateData.member = resultValue.table;
        if(json.functionBody) {
            updateData.functionBody = json.functionBody;
            updateData.supplementalCode = json.supplementalCode;
        }
        else {
            updateData.data = json.data;
        }
        updateDataList.push(updateData);
    }
}

//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.TableControl.generator = {};
visicomp.app.visiui.TableControl.generator.name = "Table";
visicomp.app.visiui.TableControl.generator.showCreateDialog = visicomp.app.visiui.TableControl.showCreateDialog;
visicomp.app.visiui.TableControl.generator.createFromJson = visicomp.app.visiui.TableControl.createfromJson;

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





//
//
//    //add table listener
//    var addTableListener = function() {
//        if(!instance.workspaceUI) {
//            alert("There is no workspace open");
//            return;
//        }
//        
//        var onCreate = function(parent,tableName) {
//            var returnValue = visicomp.core.createtable.createTable(parent,tableName);
//            if(returnValue.success) {
//                var table = returnValue.table;
//                var tableUiInit = visicomp.app.visiui.TableUI.populateTableWindow;
//                instance.workspaceUI.objectAdded(table,tableUiInit);
//            }
//            else {
//                //no action for now
//            }
//            return returnValue;
//        }
//        visicomp.app.visiui.dialog.showCreateChildDialog("Table",instance.workspaceUI.objectUIMap,instance.activeFolderName,onCreate);
//    }
//    this.addListener("folderAddTable",addTableListener);
//    