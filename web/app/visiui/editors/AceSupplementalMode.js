
visicomp.app.visiui.AceSupplementalMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new visicomp.app.visiui.AceTextEditor(component,"ace/mode/javascript",onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
visicomp.app.visiui.AceSupplementalMode.prototype.isData = false;

visicomp.app.visiui.AceSupplementalMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
visicomp.app.visiui.AceSupplementalMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var codeText = table.getSupplementalCode();	
	
	this.editor.showData(codeText,editOk);
}

visicomp.app.visiui.AceSupplementalMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

visicomp.app.visiui.AceSupplementalMode.prototype.onSave = function(text) {	
	var table = this.component.getObject();
	var functionBody = table.getFunctionBody();
	var supplementalCode = text;
	var argList = table.getArgList();
	var actionResponse =  visicomp.core.updatemember.updateCode(table,argList,functionBody,supplementalCode);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
visicomp.app.visiui.AceSupplementalMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
