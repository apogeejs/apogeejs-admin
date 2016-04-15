
visicomp.app.visiui.AceSupplementalMode = function(component) {
	//base constructor
	visicomp.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

visicomp.app.visiui.AceSupplementalMode.prototype = Object.create(visicomp.app.visiui.AceCodeModeBase.prototype);
visicomp.app.visiui.AceSupplementalMode.prototype.constructor = visicomp.app.visiui.AceSupplementalMode;

visicomp.app.visiui.AceSupplementalMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var codeText = table.getSupplementalCode();	
	
	this.editor.showData(codeText,editOk);
}

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
