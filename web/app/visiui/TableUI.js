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
    var editDataButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit Data"});
    editDataButton.onclick = function() {
        visicomp.app.visiui.TableUI.createEditDataDialog(table);
    }
    window.addTitleBarElement(editDataButton);
	var editCodeButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit Code"});
    editCodeButton.onclick = function() {
        visicomp.app.visiui.TableUI.createEditCodeDialog(table);
    }
    window.addTitleBarElement(editCodeButton);
	
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

visicomp.app.visiui.TableUI.createEditDataDialog = function(table) {
    
    //create save handler
    var onSave = function(table,data) {
        return visicomp.core.updatemember.updateData(table,data);
    };
    
    visicomp.app.visiui.dialog.showUpdateTableDataDialog(table,onSave);
}

visicomp.app.visiui.TableUI.createEditCodeDialog = function(table) {
    
    //create save handler
    var onSave = function(table,functionBody,supplementalCode) {
        return visicomp.core.updatemember.updateCode(table,functionBody,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateCodeableDialog(table,onSave,"UpdateTable",visicomp.app.visiui.TableUI.editorCodeWrapper);
}

/** This method updates the table data */    
visicomp.app.visiui.TableUI.tableUpdated = function(childUI,table) {
    var textData = JSON.stringify(table.getData(),null,visicomp.app.visiui.TableUI.formatString);
    if(childUI.editor) {
        childUI.editor.getSession().setValue(textData);
    }
}

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

visicomp.app.visiui.TableUI.editorCodeWrapper = {};

visicomp.app.visiui.TableUI.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
visicomp.app.visiui.TableUI.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.app.visiui.TableUI.editorCodeWrapper.displayName = "Formula";

visicomp.app.visiui.TableUI.editorCodeWrapper.wrapCode = function(formula) { 
    return visicomp.app.visiui.TableUI.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        visicomp.app.visiui.TableUI.editorCodeWrapper.FUNCTION_SUFFIX;
}

visicomp.app.visiui.TableUI.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}






