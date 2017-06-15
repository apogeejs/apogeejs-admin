
haxapp.app.TextAreaMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);	
}

haxapp.app.TextAreaMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.TextAreaMode.prototype.constructor = haxapp.app.TextAreaMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.TextAreaMode.formatString = "\t";

haxapp.app.TextAreaMode.prototype.createDisplay = function() {
    return new haxapp.app.TextAreaEditor(this);
}

haxapp.app.TextAreaMode.prototype.getDisplayData = function() {
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
    
    return textData;
}

haxapp.app.TextAreaMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

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
