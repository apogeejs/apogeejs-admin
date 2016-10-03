
hax.app.visiui.AceCustomCodeMode = function(component) {
	//base constructor
	hax.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

hax.app.visiui.AceCustomCodeMode.prototype = Object.create(hax.app.visiui.AceCodeModeBase.prototype);
hax.app.visiui.AceCustomCodeMode.prototype.constructor = hax.app.visiui.AceCustomCodeMode;
	
hax.app.visiui.AceCustomCodeMode.prototype.showData = function(editOk) {
		
	var control = this.component.getObject();
	var resource = control.getResource();
	var codeText = resource.getCustomizeScript();
	
	this.editor.showData(codeText,editOk);
}

hax.app.visiui.AceCustomCodeMode.prototype.onSave = function(text) {	
	
	var control = this.component.getObject();
	var resource = control.getResource();
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = text;
	var supplementalCode = resource.getSupplementalCode();
	
	var component = this.getComponent();
	var actionResponse = component.update(html,customizeScript,supplementalCode,css);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
