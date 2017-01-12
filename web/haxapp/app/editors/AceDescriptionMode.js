
haxapp.app.AceDescriptionMode = function(componentDisplay) {
	this.componentDisplay = componentDisplay;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
    this.editor = new haxapp.app.TextAreaEditor(componentDisplay,onSave,onCancel);
	//this.editor = new haxapp.app.AceTextEditor(componentDisplay,"ace/mode/text",onSave,onCancel);
	
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.AceDescriptionMode.formatString = "\t";

/** This indicates if this element displays data or something else (code) */
haxapp.app.AceDescriptionMode.prototype.isData = false;

haxapp.app.AceDescriptionMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.AceDescriptionMode.prototype.showData = function(editOk) {
		
	var table = this.componentDisplay.getObject();
	var json = table.getDescription();	

	this.editOk = editOk;
	
	var textData;
	if((json === null)||(json === undefined)) {
		textData = "";
	}
	else {
		textData = json;
	}
	
	this.editor.showData(textData,editOk);
}

haxapp.app.AceDescriptionMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

haxapp.app.AceDescriptionMode.prototype.onSave = function(text) {
	
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
	
	var table = this.componentDisplay.getObject();
    
    var actionData = {};
    actionData.action = "updateDescription";
    actionData.member = table;
    actionData.description = text;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
haxapp.app.AceDescriptionMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
