
haxapp.app.AceDataMode = function(component,doJsonFormatting) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
    var mode = doJsonFormatting ? "ace/mode/json" : "ace/mode/text";
	this.editor = new haxapp.app.AceTextEditor(component,mode,onSave,onCancel);
	
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.AceDataMode.formatString = "\t";

/** This indicates if this element displays data or something else (code) */
haxapp.app.AceDataMode.prototype.isData = true;

haxapp.app.AceDataMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.AceDataMode.prototype.showData = function(editOk) {
		
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
		textData = JSON.stringify(json,null,haxapp.app.AceDataMode.formatString);
	}
	
	this.editor.showData(textData,editOk);
}

haxapp.app.AceDataMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

haxapp.app.AceDataMode.prototype.onSave = function(text) {
	
	
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
haxapp.app.AceDataMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
