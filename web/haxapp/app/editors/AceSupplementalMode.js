
haxapp.app.AceSupplementalMode = function(component) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

haxapp.app.AceSupplementalMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceSupplementalMode.prototype.constructor = haxapp.app.AceSupplementalMode;

haxapp.app.AceSupplementalMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var codeText = table.getSupplementalCode();	
	
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceSupplementalMode.prototype.onSave = function(text) {	
	var table = this.component.getObject();
	var functionBody = table.getFunctionBody();
	var supplementalCode = text;
	var argList = table.getArgList();
	var actionResponse =  hax.updatemember.updateCode(table,argList,functionBody,supplementalCode);
	if(!actionResponse.getSuccess()) {
		//show an error message
//no alert here - error display is adequate
//			var msg = actionResponse.getErrorMsg();
//			alert(msg);
	}
        
	return true;  
}
