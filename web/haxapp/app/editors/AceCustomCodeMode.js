
haxapp.app.AceCustomCodeMode = function(componentDisplay) {
    haxapp.app.ViewMode.call(this,componentDisplay,false);
	this.setEditor( new haxapp.app.AceTextEditor(this,"ace/mode/javascript"));
}

haxapp.app.AceCustomCodeMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceCustomCodeMode.prototype.constructor = haxapp.app.AceCustomCodeMode;
	
haxapp.app.AceCustomCodeMode.prototype.showData = function() {
	var codeText = this.component.getCustomizeScript();
	this.editor.showData(codeText,this.getIsEditable());
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
