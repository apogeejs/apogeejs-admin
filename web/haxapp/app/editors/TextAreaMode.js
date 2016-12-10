
haxapp.app.TextAreaMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new haxapp.app.TextAreaEditor(component,onSave,onCancel);
	
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.TextAreaMode.formatString = "\t";

/** This indicates if this element displays data or something else (code) */
haxapp.app.TextAreaMode.prototype.isData = true;

haxapp.app.TextAreaMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.TextAreaMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	

	this.editOk = editOk;
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,haxapp.app.TextAreaMode.formatString);
	}
	
	this.editor.showData(textData,editOk);
}

haxapp.app.TextAreaMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

haxapp.app.TextAreaMode.prototype.onSave = function(text) {
	
	
	var data;
	if(text.length > 0) {
		try {
			data = JSON.parse(text);
		}
		catch(error) {
			//parsing error
			alert("There was an error parsing the JSON input: " +  error.message);
			return false;
		}
	}
	else {
		data = "";
	}
	
	var table = this.component.getObject();
	
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = table;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
haxapp.app.TextAreaMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
