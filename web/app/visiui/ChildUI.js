/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.app.visiui.ChildUI = function(child,parentElement) {

    this.object = child;
    this.name = child.getName();
    this.parentElement = parentElement;
    this.dataEventManager = child.getWorkspace().getEventManager();
    this.windowEventManager = null;//look this up below

    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    this.window = new visicomp.visiui.StackWindow(this.parentElement,this.name,options);
    this.windowEventManager =  this.window.getEventManager();
    
    //load the content div
    var content = visicomp.visiui.createElement("div",null,
            {
                "position":"absolute",
                "top":"0px",
                "bottom":"0px",
                "right":"0px",
                "left":"0px"
            });

	switch(child.getType()) {
		case "package":
			break;
			
		case "table":
			break;
			
		case "function":
			break;
			
		default:
			alert("Unsupported object type for a UI object");
	}
    //create the window and editor (for display, not editing)
    visicomp.app.visiui.dialog.showTableWindow(this);
}

visicomp.app.visiui.ChildUI.prototype.getWindow = function() {
    return this.window;
}

//get content window? only used for package

/** This method removes the window element from the parent. */
visicomp.app.visiui.ChildUI.prototype.deleteUIElement = function() {
    if((this.parentElement)&&(this.window)) {
		var windowElement = this.window.getElement();
		this.parentElement.removeChild(windowElement);
	}
}



visicomp.app.visiui.ChildUI.formatString = "\t"

visicomp.app.visiui.ChildUI.prototype.createEditDialog = function() {
    
    //create save handler
    var instance = this;
    var onSave = function(data,formula,supplementalCode) {
        return instance.updateTable(data,formula,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateTableDialog(this.table,onSave);
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.ChildUI.prototype.updateTable = function(data,formula,supplementalCode) {
	
	var updateEventData = visicomp.app.visiui.ChildUI.getUpdateEventData(this.table,data,formula,supplementalCode);
	
    var result = this.dataEventManager.callHandler(
        visicomp.core.updatemember.UPDATE_MEMBER_HANDLER,
        updateEventData);
		
    return result;
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.ChildUI.prototype.deleteTable = function() {
	var eventData = {};
	eventData.child = this.table;
	
    var result = this.dataEventManager.callHandler(
        visicomp.core.deletechild.DELETE_CHILD_HANDLER,
        eventData);
		
    return result;
}
    
/** This method updates the table data */    
visicomp.app.visiui.ChildUI.prototype.tableUpdated = function(table) {
    if(this.table != table) return;
    
    var textData = JSON.stringify(table.getData(),null,visicomp.app.visiui.ChildUI.formatString);
    if(this.editor) {
        this.editor.getSession().setValue(textData);
    }
}

/** This method creates the update event object for this table object. */
visicomp.app.visiui.ChildUI.getUpdateEventData = function(table,data,formula,supplementalCode) {
	
	var tableData = {};
    tableData.member = table;
	if((formula !== null)&&(formula !== undefined)) {
		tableData.editorInfo = formula;
        tableData.functionText = visicomp.app.visiui.ChildUI.wrapTableFormula(formula);
		tableData.supplementalCode = supplementalCode;
	}
	else {
		tableData.data = data;
	}
	
    return tableData;
}

visicomp.app.visiui.ChildUI.wrapTableFormula = function(formula) { 

    var functionText = "function() {\n" + 
        "var value;\n" + 
        formula + "\n" +
        "return value;\n\n" +
    "}";
    return functionText;
}



