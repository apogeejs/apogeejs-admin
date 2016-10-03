
hax.app.visiui.AceDataMode = function(component,doJsonFormatting) {
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
	this.editor = new hax.app.visiui.AceTextEditor(component,mode,onSave,onCancel);
	
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
hax.app.visiui.AceDataMode.formatString = "\t";

/** This indicates if this element displays data or something else (code) */
hax.app.visiui.AceDataMode.prototype.isData = true;

hax.app.visiui.AceDataMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
hax.app.visiui.AceDataMode.prototype.showData = function(editOk) {
		
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
		textData = JSON.stringify(json,null,hax.app.visiui.AceDataMode.formatString);
	}
	
	this.editor.showData(textData,editOk);
}

hax.app.visiui.AceDataMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

hax.app.visiui.AceDataMode.prototype.onSave = function(text) {
	
	
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
	hax.core.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}
hax.app.visiui.AceDataMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
