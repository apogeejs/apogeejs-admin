
haxapp.app.AceCustomCodeMode = function(componentDisplay) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,componentDisplay,"ace/mode/javascript");
}

haxapp.app.AceCustomCodeMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceCustomCodeMode.prototype.constructor = haxapp.app.AceCustomCodeMode;
	
haxapp.app.AceCustomCodeMode.prototype.showData = function(editOk) {
    
    var component = componentDisplay.getComponent();
		
	var codeText = component.getCustomizeScript();
	
    this.editOk = editOk;
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceCustomCodeMode.prototype.onSave = function(text) {	
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = text;
	var supplementalCode = component.getSupplementalCode();
	
	var actionResponse = component.update(html,customizeScript,supplementalCode,css);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
