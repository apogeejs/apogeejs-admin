/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.app.visiui.TableUI = function(table,parentElement) {

    this.table = table;
    this.name = table.getName();
    this.parentElement = parentElement;
    this.dataEventManager = table.getWorkspace().getEventManager();
    this.windowEventManager = null;//look this up below

    //subscribe to update event
    var instance = this;
    var tableUpdatedCallback = function(tableObject) {
        instance.tableUpdated(tableObject);
    }
    this.dataEventManager.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, tableUpdatedCallback);

    //create the window and editor (for display, not editing)
    visicomp.app.visiui.dialog.showTableWindow(this);
}

visicomp.app.visiui.TableUI.formatString = "\t"

visicomp.app.visiui.TableUI.prototype.getWindow = function() {
    return this.window;
}

visicomp.app.visiui.TableUI.prototype.createEditDialog = function() {
    
    //create save handler
    var instance = this;
    var onSave = function(data,formula,supplementalCode) {
        return instance.updateTable(data,formula,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateTableDialog(this.table,onSave);
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.TableUI.prototype.updateTable = function(data,formula,supplementalCode) {
	
	var updateEventData = visicomp.app.visiui.TableUI.getUpdateEventData(this.table,data,formula,supplementalCode);
	
    var result = this.dataEventManager.callHandler(
        visicomp.core.updatemember.UPDATE_MEMBER_HANDLER,
        updateEventData);
		
    return result;
}
    
/** This method updates the table data */    
visicomp.app.visiui.TableUI.prototype.tableUpdated = function(table) {
    if(this.table != table) return;
    
    var textData = JSON.stringify(table.getData(),null,visicomp.app.visiui.TableUI.formatString);
    if(this.editor) {
        this.editor.getSession().setValue(textData);
    }
}

/** This method creates the update event object for this table object. */
visicomp.app.visiui.TableUI.getUpdateEventData = function(table,data,formula,supplementalCode) {
	
	var tableData = {};
    tableData.member = table;
	if((formula !== null)&&(formula !== undefined)) {
		tableData.editorInfo = formula;
        tableData.functionText = visicomp.app.visiui.TableUI.wrapTableFormula(formula);
		tableData.supplementalCode = supplementalCode;
	}
	else {
		tableData.data = data;
	}
	
    return tableData;
}

visicomp.app.visiui.TableUI.wrapTableFormula = function(formula) { 

    var functionText = "function() {\n" + 
        "var value;\n" + 
        formula + "\n" +
        "return value;\n\n" +
    "}";
    return functionText;
}

