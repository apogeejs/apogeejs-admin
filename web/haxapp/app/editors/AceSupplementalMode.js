
haxapp.app.AceSupplementalMode = function(componentDisplay) {
    haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.AceSupplementalMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceSupplementalMode.prototype.constructor = haxapp.app.AceSupplementalMode;

haxapp.app.AceSupplementalMode.prototype.showData = function() {
		
	var codeText = this.member.getSupplementalCode();	
	
    if(!this.editor) {
        this.editor = new haxapp.app.AceTextEditor(this,"ace/mode/javascript");
    }
	this.editor.showData(codeText,true);
}

haxapp.app.AceSupplementalMode.prototype.onSave = function(text) {	

	var actionData = {};
        actionData.action = "updateCode";
        actionData.member = this.member;
        actionData.argList = this.member.getArgList();
        actionData.functionBody = this.member.getFunctionBody();
        actionData.supplementalCode = text;  
        
		var actionResponse =  hax.action.doAction(actionData);
        
	if(!actionResponse.getSuccess()) {
		//show an error message
//no alert here - error display is adequate
//			var msg = actionResponse.getErrorMsg();
//			alert(msg);
	}
        
	return true;  
}
