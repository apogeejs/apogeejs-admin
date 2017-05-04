
haxapp.app.AceTextMode = function(componentDisplay) {
    haxapp.app.ViewMode.call(this,componentDisplay,true);
	this.setEditor(new haxapp.app.AceTextEditor(this,"ace/mode/text"));
}

haxapp.app.AceTextMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceTextMode.prototype.constructor = haxapp.app.AceTextMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.AceTextMode.formatString = "\t";
	
haxapp.app.AceTextMode.prototype.showData = function() {
		
	var table = this.componentDisplay.getObject();
	var json = table.getData();	
	
	var textData;
	if((json === null)||(json === undefined)) {
		textData = "";
	}
	else {
		textData = json;
	}
    
	this.editor.showData(textData,this.getIsEditable());
}

haxapp.app.AceTextMode.prototype.onSave = function(text) {
	
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
	
	var table = this.componentDisplay.getObject();
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = table;
    actionData.data = text;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
