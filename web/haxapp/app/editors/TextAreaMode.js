
haxapp.app.TextAreaMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,true);

	this.setEditor(new haxapp.app.TextAreaEditor(this));
	
}

haxapp.app.TextAreaMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.TextAreaMode.prototype.constructor = haxapp.app.TextAreaMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.TextAreaMode.formatString = "\t";

haxapp.app.TextAreaMode.prototype.showData = function() {
		
	var table = this.componentDisplay.getObject();
	var json = table.getData();	
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,haxapp.app.TextAreaMode.formatString);
	}
	
	this.editor.showData(textData,this.getIsEditable());
}

//==============================
// internal
//==============================

haxapp.app.TextAreaMode.prototype.onSave = function(text) {
	
	
	var data;
	if(text.length > 0) {
		try {
			data = JSON.parse(text);
		}
		catch(error) {
			//parsing error
			alert("There was an error parsing the JSON input: " +  error.message);
			return false;
		}
	}
	else {
		data = "";
	}
	
	var table = this.componentDisplay.getObject();
	
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = table;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
