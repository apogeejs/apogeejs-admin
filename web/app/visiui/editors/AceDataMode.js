
visicomp.app.visiui.AceDataMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new visicomp.app.visiui.AceTextEditor(component,"ace/mode/json",onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
visicomp.app.visiui.AceDataMode.prototype.isData = true;

visicomp.app.visiui.AceDataMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
visicomp.app.visiui.AceDataMode.prototype.showData = function(editOk) {
		
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
		textData = JSON.stringify(json,null,visicomp.app.visiui.JsonTableComponent.formatString);
	}
	
	this.editor.showData(textData,editOk);
}

visicomp.app.visiui.AceDataMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

visicomp.app.visiui.AceDataMode.prototype.onSave = function(text) {
	
	
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
	visicomp.core.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}
visicomp.app.visiui.AceDataMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
