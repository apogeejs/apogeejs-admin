/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.visiui.TableUI = function(table,parentElement) {

    this.table = table;
    this.name = table.getName();
    this.parentElement = parentElement;
    this.name = table.getName();
    this.dataEventManager = table.getPackage().getWorkspace().getEventManager();
    this.windowEventManager = null;//look this up below

    //subscribe to update event
    var instance = this;
    var tableUpdatedCallback = function(tableData) {
        instance.updateTableData(tableData);
    }
    this.dataEventManager.addListener(visicomp.core.updatetable.TABLE_UPDATED_EVENT, tableUpdatedCallback);

    //create the window and editor (for display, not editing)
    visicomp.app.visiui.dialog.tableWindow(this);
}

visicomp.visiui.TableUI.formatString = "\t"

visicomp.visiui.TableUI.prototype.getWindow = function() {
    return this.window;
}

visicomp.visiui.TableUI.prototype.createEditDialog = function() {
    
    //create save handler
    var instance = this;
    var onSave = function(handlerData) {
        return instance.dataEventManager.callHandler(
            visicomp.core.updatetable.UPDATE_TABLE_HANDLER,handlerData);
    };
    
    visicomp.app.visiui.dialog.updateTableDialog(this.table,onSave);
}
    
/** This method updates the table data */    
visicomp.visiui.TableUI.prototype.updateTableData = function(table) {
    if(this.table != table) return;
    
    var textData = JSON.stringify(table.getData(),null,visicomp.visiui.TableUI.formatString);
    if(this.editor) {
        this.editor.getSession().setValue(textData);
    }
}

