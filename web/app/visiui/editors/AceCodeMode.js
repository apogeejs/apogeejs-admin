
visicomp.app.visiui.AceCodeMode = function(component,optionalEditorCodeWrapper) {
	this.component = component;
	this.editorCodeWrapper = optionalEditorCodeWrapper;
	
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
visicomp.app.visiui.AceCodeMode.prototype.isData = false;

visicomp.app.visiui.AceCodeMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
visicomp.app.visiui.AceCodeMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var functionBody = table.getFunctionBody();
	
	var codeText;
	if(this.editorCodeWrapper) {
		codeText = this.editorCodeWrapper.unwrapCode(functionBody);
	}
	else {
		codeText = functionBody;
	}
	
	this.editor.showData(codeText,editOk);
}

visicomp.app.visiui.AceCodeMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

visicomp.app.visiui.AceCodeMode.prototype.onSave = function(text) {	
	
	var table = this.component.getObject();
	
	var functionBody;
	if(this.editorCodeWrapper) {
		functionBody = this.editorCodeWrapper.wrapCode(text);
	}
	else {
		functionBody = text;
	}
	
	var supplementalCode = table.getSupplementalCode();
	var argList = table.getArgList();
	var actionResponse =  visicomp.core.updatemember.updateCode(table,argList,functionBody,supplementalCode);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
visicomp.app.visiui.AceCodeMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
