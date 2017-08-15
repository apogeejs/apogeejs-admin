
apogeeapp.app.AceSupplementalMode = function(componentDisplay) {
    apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.AceSupplementalMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceSupplementalMode.prototype.constructor = apogeeapp.app.AceSupplementalMode;

apogeeapp.app.AceSupplementalMode.prototype.createDisplay = function() {
    return new apogeeapp.app.AceTextEditor(this,"ace/mode/javascript");
}

apogeeapp.app.AceSupplementalMode.prototype.getDisplayData = function() {
    return this.member.getSupplementalCode();;
}

apogeeapp.app.AceSupplementalMode.prototype.getIsDataEditable = function() {
    return true;
}

apogeeapp.app.AceSupplementalMode.prototype.onSave = function(text) {	

	var actionData = {};
        actionData.action = "updateCode";
        actionData.member = this.member;
        actionData.argList = this.member.getArgList();
        actionData.functionBody = this.member.getFunctionBody();
        actionData.supplementalCode = text;  
        
		var actionResponse =  apogee.action.doAction(actionData);
        
	if(!actionResponse.getSuccess()) {
		//show an error message
//no alert here - error display is adequate
//			var msg = actionResponse.getErrorMsg();
//			alert(msg);
	}
        
	return true;  
}
