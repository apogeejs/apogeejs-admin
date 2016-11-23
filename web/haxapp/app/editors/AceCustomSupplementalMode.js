
haxapp.app.AceCustomSupplementalMode = function(component) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

haxapp.app.AceCustomSupplementalMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceCustomSupplementalMode.prototype.constructor = haxapp.app.AceCustomSupplementalMode;

haxapp.app.AceCustomSupplementalMode.prototype.showData = function(editOk) {
	var codeText = this.component.getSupplementalCode();
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceCustomSupplementalMode.prototype.onSave = function(text) {	
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = this.component.getCustomizeScript();
	var supplementalCode = text;
	
	var component = this.getComponent();
	var actionResponse = component.update(html,customizeScript,supplementalCode,css);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
