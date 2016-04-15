
visicomp.app.visiui.AceCodeMode = function(component,optionalEditorCodeWrapper) {
	//base constructor
	visicomp.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
	
	this.editorCodeWrapper = optionalEditorCodeWrapper;
}

visicomp.app.visiui.AceCodeMode.prototype = Object.create(visicomp.app.visiui.AceCodeModeBase.prototype);
visicomp.app.visiui.AceCodeMode.prototype.constructor = visicomp.app.visiui.AceCodeMode;
	
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
