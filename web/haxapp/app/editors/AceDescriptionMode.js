
haxapp.app.AceDescriptionMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,false);

    this.setEditor(new haxapp.app.TextAreaEditor(this));
	//this.setEditor(new haxapp.app.AceTextEditor(componentDisplay,"ace/mode/text",onSave,onCancel));
}

haxapp.app.AceDescriptionMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceDescriptionMode.prototype.constructor = haxapp.app.AceDescriptionMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.AceDescriptionMode.formatString = "\t";

haxapp.app.AceDescriptionMode.prototype.showData = function() {
		
	var table = this.componentDisplay.getObject();
	var json = table.getDescription();	
	
	var textData;
	if((json === null)||(json === undefined)) {
		textData = "";
	}
	else {
		textData = json;
	}
	
	this.editor.showData(textData,this.getIsEditable());
}

//==============================
// internal
//==============================

haxapp.app.AceDescriptionMode.prototype.onSave = function(text) {
	
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
	
	var table = this.componentDisplay.getObject();
    
    var actionData = {};
    actionData.action = "updateDescription";
    actionData.member = table;
    actionData.description = text;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
