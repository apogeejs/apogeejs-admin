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
        return visicomp.core.updatemember.updateObject(table,data,formula,supplementalCode);
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

visicomp.app.visiui.TableUI.FUNCTION_PREFIX = "var value;\n";
visicomp.app.visiui.TableUI.FUNCTION_SUFFIX = "\nreturn value;\n\n";

visicomp.app.visiui.TableUI.wrapTableFormula = function(formula) { 
    return visicomp.app.visiui.TableUI.FUNCTION_PREFIX + formula + 
        visicomp.app.visiui.TableUI.FUNCTION_SUFFIX;
}

visicomp.app.visiui.TableUI.unwrapTableFormula = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}






