
haxapp.app.AceSupplementalMode = function(componentDisplay) {
    haxapp.app.ViewMode.call(this,componentDisplay,false);
	this.setEditor(new haxapp.app.AceTextEditor(this,"ace/mode/javascript"));
}

haxapp.app.AceSupplementalMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceSupplementalMode.prototype.constructor = haxapp.app.AceSupplementalMode;

haxapp.app.AceSupplementalMode.prototype.showData = function() {
		
	var table = this.componentDisplay.getObject();
	var codeText = table.getSupplementalCode();	
	
	this.editor.showData(codeText,this.getIsEditable());
}

haxapp.app.AceSupplementalMode.prototype.onSave = function(text) {	
	var table = this.componentDisplay.getObject();
    
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
