
haxapp.app.AceCustomSupplementalMode = function(componentDisplay) {
    haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.AceCustomSupplementalMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceCustomSupplementalMode.prototype.constructor = haxapp.app.AceCustomSupplementalMode;

haxapp.app.AceCustomSupplementalMode.prototype.createDisplay = function() {
    return new haxapp.app.AceTextEditor(this,"ace/mode/javascript");
}

haxapp.app.AceCustomSupplementalMode.prototype.getDisplayData = function() {
	return this.component.getSupplementalCode();
}

haxapp.app.AceCustomSupplementalMode.prototype.getIsDataEditable = function() {
    return true;
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
