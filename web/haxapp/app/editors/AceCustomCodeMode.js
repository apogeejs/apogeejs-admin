
haxapp.app.AceCustomCodeMode = function(component) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

haxapp.app.AceCustomCodeMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceCustomCodeMode.prototype.constructor = haxapp.app.AceCustomCodeMode;
	
haxapp.app.AceCustomCodeMode.prototype.showData = function(editOk) {
		
	var codeText = this.component.getCustomizeScript();
	
    this.editOk = editOk;
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceCustomCodeMode.prototype.onSave = function(text) {	
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = text;
	var supplementalCode = this.component.getSupplementalCode();
	
	var actionResponse = this.component.update(html,customizeScript,supplementalCode,css);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
