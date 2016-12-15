
haxapp.app.AceTextMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new haxapp.app.AceTextEditor(component,"ace/mode/text",onSave,onCancel);
	
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.AceTextMode.formatString = "\t";

/** This indicates if this element displays data or something else (code) */
haxapp.app.AceTextMode.prototype.isData = true;

haxapp.app.AceTextMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.AceTextMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	

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

haxapp.app.AceTextMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

haxapp.app.AceTextMode.prototype.onSave = function(text) {
	
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
	
	var table = this.component.getObject();
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = table;
    actionData.data = text;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
haxapp.app.AceTextMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
