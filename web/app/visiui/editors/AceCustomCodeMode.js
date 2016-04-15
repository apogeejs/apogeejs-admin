
visicomp.app.visiui.AceCustomCodeMode = function(component) {
	//base constructor
	visicomp.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

visicomp.app.visiui.AceCustomCodeMode.prototype = Object.create(visicomp.app.visiui.AceCodeModeBase.prototype);
visicomp.app.visiui.AceCustomCodeMode.prototype.constructor = visicomp.app.visiui.AceCustomCodeMode;
	
visicomp.app.visiui.AceCustomCodeMode.prototype.showData = function(editOk) {
		
	var control = this.component.getObject();
	var resource = control.getResource();
	var codeText = resource.getCustomizeScript();
	
	this.editor.showData(codeText,editOk);
}

visicomp.app.visiui.AceCustomCodeMode.prototype.onSave = function(text) {	
	
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
