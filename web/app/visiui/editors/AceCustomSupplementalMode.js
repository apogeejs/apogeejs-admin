
visicomp.app.visiui.AceCustomSupplementalMode = function(component) {
	//base constructor
	visicomp.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

visicomp.app.visiui.AceCustomSupplementalMode.prototype = Object.create(visicomp.app.visiui.AceCodeModeBase.prototype);
visicomp.app.visiui.AceCustomSupplementalMode.prototype.constructor = visicomp.app.visiui.AceCustomSupplementalMode;

visicomp.app.visiui.AceCustomSupplementalMode.prototype.showData = function(editOk) {
		
	var control = this.component.getObject();
	var resource = control.getResource();
	var codeText = resource.getSupplementalCode();
	
	this.editor.showData(codeText,editOk);
}

visicomp.app.visiui.AceCustomSupplementalMode.prototype.onSave = function(text) {	
	var control = this.component.getObject();
	var resource = control.getResource();
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = resource.getCustomizeScript();
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
