
haxapp.app.AceCustomSupplementalMode = function(componentDisplay) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,componentDisplay,"ace/mode/javascript");
}

haxapp.app.AceCustomSupplementalMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceCustomSupplementalMode.prototype.constructor = haxapp.app.AceCustomSupplementalMode;

haxapp.app.AceCustomSupplementalMode.prototype.showData = function(editOk) {
    var component = this.componentDisplay.getComponent();
	var codeText = component.getSupplementalCode();
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceCustomSupplementalMode.prototype.onSave = function(text) {
    
    var component = this.componentDisplay.getComponent();
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = component.getCustomizeScript();
	var supplementalCode = text;
	
	var actionResponse = component.update(html,customizeScript,supplementalCode,css);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
