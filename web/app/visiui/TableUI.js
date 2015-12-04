visicomp.app.visiui.TableUI = {};

visicomp.app.visiui.TableUI.populateTableWindow = function(childUI,table) {
    
    //subscribe to table update event
    var tableUpdatedCallback = function(tableObject) {
        if(tableObject === table) {
            visicomp.app.visiui.TableUI.tableUpdated(childUI,table);
        }
    }
    
    var workspace = table.getWorkspace();
    
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, tableUpdatedCallback);
    
    //editor - only for display, read only
    var contentDiv = childUI.getContentElement();
    var editor = ace.edit(contentDiv);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode("ace/mode/json"); 
    childUI.editor = editor;
    
    var window = childUI.getWindow();
    
    //resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
    window.addListener("resize", resizeCallback);
    
    //create the edit button
    var editButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit"});
    editButton.onclick = function() {
        visicomp.app.visiui.TableUI.createEditDialog(table);
    }
    window.addTitleBarElement(editButton);
	
//	//create the delete button
//    var deleteButton = visicomp.visiui.createElement("button",{"innerHTML":"Delete"});
//    deleteButton.onclick = function() {
//        //we should get confirmation
//
//		childUI.deleteTable();
//    }
//    window.addTitleBarElement(deleteButton);

    //dummy size
window.setSize(200,200);

}

visicomp.app.visiui.TableUI.formatString = "\t";

visicomp.app.visiui.TableUI.createEditDialog = function(table) {
    
    //create save handler
    var onSave = function(table,data,formula,supplementalCode) {
        return visicomp.app.visiui.TableUI.updateTable(table,data,formula,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateTableDialog(table,onSave);
}

/** This method updates the table data */    
visicomp.app.visiui.TableUI.tableUpdated = function(childUI,table) {
    var textData = JSON.stringify(table.getData(),null,visicomp.app.visiui.TableUI.formatString);
    if(childUI.editor) {
        childUI.editor.getSession().setValue(textData);
    }
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.TableUI.updateTable = function(table,data,functionBody,supplementalCode) {
    
	var updateEventData = visicomp.app.visiui.TableUI.getUpdateEventData(table,data,functionBody,supplementalCode);
	
    var workspace = table.getWorkspace();
    var result = workspace.callHandler(
        visicomp.core.updatemember.UPDATE_MEMBER_HANDLER,
        updateEventData);
		
    return result;
}

/** This method creates the update event object for this table object. */
visicomp.app.visiui.TableUI.getUpdateEventData = function(table,data,functionBody,supplementalCode) {
	
	var tableData = {};
    tableData.member = table;
	if((functionBody !== null)&&(functionBody !== undefined)) {
        tableData.functionBody = functionBody;
		tableData.supplementalCode = supplementalCode;
	}
	else {
		tableData.data = data;
	}
	
    return tableData;
}

visicomp.app.visiui.TableUI.FUNCTION_PREFIX = "var value;\n";
visicomp.app.visiui.TableUI.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.app.visiui.TableUI.wrapTableFormula = function(formula) { 
    return visicomp.app.visiui.TableUI.FUNCTION_PREFIX + formula + 
        visicomp.app.visiui.TableUI.FUNCTION_SUFFIX;
}

visicomp.app.visiui.TableUI.unwrapTableFormula = function(functionBody) {
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}









////////////////////////////////////////////////////////////////////////////////
//
//
//
///** This is a editor element for holding an arbitrary JSON object.
// *
// * @class 
// */
//visicomp.app.visiui.TableUI = function(table,parentElement) {
//
//    this.table = table;
//    this.name = table.getName();
//    this.parentElement = parentElement;
//    this.dataEventManager = table.getWorkspace().getEventManager();
//    this.windowEventManager = null;//look this up below
//
//    //subscribe to update event
//    var instance = this;
//    var tableUpdatedCallback = function(tableObject) {
//        instance.tableUpdated(tableObject);
//    }
//    this.dataEventManager.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, tableUpdatedCallback);
//
//    //create the window and editor (for display, not editing)
//    visicomp.app.visiui.dialog.showTableWindow(this);
//}
//
//
//
//visicomp.app.visiui.TableUI.prototype.getWindow = function() {
//    return this.window;
//}
//
//visicomp.app.visiui.TableUI.prototype.createEditDialog = function() {
//    
//    //create save handler
//    var instance = this;
//    var onSave = function(data,formula,supplementalCode) {
//        return instance.updateTable(data,formula,supplementalCode);
//    };
//    
//    visicomp.app.visiui.dialog.showUpdateTableDialog(this.table,onSave);
//}
//
///** This method responds to a "new" menu event. */
//visicomp.app.visiui.TableUI.prototype.updateTable = function(data,formula,supplementalCode) {
//	
//	var updateEventData = visicomp.app.visiui.TableUI.getUpdateEventData(this.table,data,formula,supplementalCode);
//	
//    var result = this.dataEventManager.callHandler(
//        visicomp.core.updatemember.UPDATE_MEMBER_HANDLER,
//        updateEventData);
//		
//    return result;
//}
//
///** This method responds to a "new" menu event. */
//visicomp.app.visiui.TableUI.prototype.deleteTable = function() {
//	var eventData = {};
//	eventData.child = this.table;
//	
//    var result = this.dataEventManager.callHandler(
//        visicomp.core.deletechild.DELETE_CHILD_HANDLER,
//        eventData);
//		
//    return result;
//}
//    
//
//
///** This method creates the update event object for this table object. */
//visicomp.app.visiui.TableUI.getUpdateEventData = function(table,data,formula,supplementalCode) {
//	
//	var tableData = {};
//    tableData.member = table;
//	if((formula !== null)&&(formula !== undefined)) {
//		tableData.editorInfo = formula;
//        tableData.functionText = visicomp.app.visiui.TableUI.wrapTableFormula(formula);
//		tableData.supplementalCode = supplementalCode;
//	}
//	else {
//		tableData.data = data;
//	}
//	
//    return tableData;
//}
//
//visicomp.app.visiui.TableUI.wrapTableFormula = function(formula) { 
//
//    var functionText = "function() {\n" + 
//        "var value;\n" + 
//        formula + "\n" +
//        "return value;\n\n" +
//    "}";
//    return functionText;
//}
//
///** This method removes the window element from the parent. */
//visicomp.app.visiui.TableUI.prototype.removeFromParent = function() {
//    if((this.parentElement)&&(this.window)) {
//		var windowElement = this.window.getElement();
//		this.parentElement.removeChild(windowElement);
//	}
//}
//
