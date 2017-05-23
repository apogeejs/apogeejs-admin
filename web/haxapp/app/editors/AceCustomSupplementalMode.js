
haxapp.app.AceCustomSupplementalMode = function(componentDisplay) {
    haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.AceCustomSupplementalMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceCustomSupplementalMode.prototype.constructor = haxapp.app.AceCustomSupplementalMode;

haxapp.app.AceCustomSupplementalMode.prototype.showData = function() {
    var component = this.componentDisplay.getComponent();
	var codeText = component.getSupplementalCode();
    if(!this.editor) {
        this.editor = new haxapp.app.AceTextEditor(this,"ace/mode/javascript");
    }
	this.editor.showData(codeText,true);
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
