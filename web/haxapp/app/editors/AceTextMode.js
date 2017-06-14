
haxapp.app.AceTextMode = function(componentDisplay) {
    haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.AceTextMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceTextMode.prototype.constructor = haxapp.app.AceTextMode;
    
haxapp.app.AceTextMode.prototype.showData = function() {
		
	var json = this.member.getData();	
	
	var textData;
	if((json === null)||(json === undefined)) {
		textData = "";
	}
	else {
		textData = json;
	}
    
    if(this.editor == null) {
        this.editor = new haxapp.app.AceTextEditor(this,"ace/mode/text");
    }
	this.editor.showData(textData,true);
}

haxapp.app.AceTextMode.prototype.onSave = function(text) {
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = text;
	var actionResponse =  hax.action.doAction(actionData);
	
	return true;
}
