
apogeeapp.app.TextAreaMode = function(componentDisplay) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);	
}

apogeeapp.app.TextAreaMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.TextAreaMode.prototype.constructor = apogeeapp.app.TextAreaMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
apogeeapp.app.TextAreaMode.formatString = "\t";

apogeeapp.app.TextAreaMode.prototype.createDisplay = function() {
    return new apogeeapp.app.TextAreaEditor(this);
}

apogeeapp.app.TextAreaMode.prototype.getDisplayData = function() {
	var json = this.member.getData();	
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,apogeeapp.app.TextAreaMode.formatString);
	}
    
    return textData;
}

apogeeapp.app.TextAreaMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

apogeeapp.app.TextAreaMode.prototype.onSave = function(text) {
	
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
	var actionResponse =  apogee.action.doAction(actionData,true);
	
	return true;
}
