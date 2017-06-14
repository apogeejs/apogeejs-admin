
haxapp.app.TextAreaMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,true);	
}

haxapp.app.TextAreaMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.TextAreaMode.prototype.constructor = haxapp.app.TextAreaMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.TextAreaMode.formatString = "\t";

haxapp.app.TextAreaMode.prototype.showData = function() {
		
	var json = this.member.getData();	
	
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
	
    if(!this.editor) {
        this.editor = new haxapp.app.TextAreaEditor(this);;
    }
	this.editor.showData(textData,this.getIsDataEditable());
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
	
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(actionData);
	
	return true;
}
