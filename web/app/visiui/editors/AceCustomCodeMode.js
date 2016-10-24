
hax.app.visiui.AceCustomCodeMode = function(component) {
	//base constructor
	hax.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

hax.app.visiui.AceCustomCodeMode.prototype = Object.create(hax.app.visiui.AceCodeModeBase.prototype);
hax.app.visiui.AceCustomCodeMode.prototype.constructor = hax.app.visiui.AceCustomCodeMode;
	
hax.app.visiui.AceCustomCodeMode.prototype.showData = function(editOk) {
		
	var codeText = this.component.getCustomizeScript();
	
    this.editOk = editOk;
	this.editor.showData(codeText,editOk);
}

hax.app.visiui.AceCustomCodeMode.prototype.onSave = function(text) {	
	
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
