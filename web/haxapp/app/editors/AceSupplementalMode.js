
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
    
	var actionData = {};
        actionData.action = "updateCode";
        actionData.member = table;
        actionData.argList = table.getArgList();
        actionData.functionBody = table.getFunctionBody();
        actionData.supplementalCode = text;  
        
		var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
        
	if(!actionResponse.getSuccess()) {
		//show an error message
//no alert here - error display is adequate
//			var msg = actionResponse.getErrorMsg();
//			alert(msg);
	}
        
	return true;  
}
