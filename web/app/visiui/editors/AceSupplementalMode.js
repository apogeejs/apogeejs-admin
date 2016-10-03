
hax.app.visiui.AceSupplementalMode = function(component) {
	//base constructor
	hax.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

hax.app.visiui.AceSupplementalMode.prototype = Object.create(hax.app.visiui.AceCodeModeBase.prototype);
hax.app.visiui.AceSupplementalMode.prototype.constructor = hax.app.visiui.AceSupplementalMode;

hax.app.visiui.AceSupplementalMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var codeText = table.getSupplementalCode();	
	
	this.editor.showData(codeText,editOk);
}

hax.app.visiui.AceSupplementalMode.prototype.onSave = function(text) {	
	var table = this.component.getObject();
	var functionBody = table.getFunctionBody();
	var supplementalCode = text;
	var argList = table.getArgList();
	var actionResponse =  hax.core.updatemember.updateCode(table,argList,functionBody,supplementalCode);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
