
apogeeapp.app.AceDataMode = function(componentDisplay,doJsonFormatting) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
    
    this.doJsonFormatting = doJsonFormatting;
}

apogeeapp.app.AceDataMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceDataMode.prototype.constructor = apogeeapp.app.AceDataMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
apogeeapp.app.AceDataMode.formatString = "\t";

apogeeapp.app.AceDataMode.prototype.createDisplay = function() {
    var mode = this.doJsonFormatting ? "ace/mode/json" : "ace/mode/text";
    return new apogeeapp.app.AceTextEditor(this,mode);
}

apogeeapp.app.AceDataMode.prototype.getDisplayData = function() {
	var json = this.member.getData();	
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,apogeeapp.app.AceDataMode.formatString);
	}
    
    return textData;
}

apogeeapp.app.AceDataMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

apogeeapp.app.AceDataMode.prototype.onSave = function(text) {
	
	
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
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}
