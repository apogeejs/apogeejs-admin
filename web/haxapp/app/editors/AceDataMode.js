
haxapp.app.AceDataMode = function(componentDisplay,doJsonFormatting) {
	haxapp.app.ViewMode.call(this,componentDisplay);
    
    this.doJsonFormatting = doJsonFormatting;
}

haxapp.app.AceDataMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceDataMode.prototype.constructor = haxapp.app.AceDataMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.AceDataMode.formatString = "\t";

haxapp.app.AceDataMode.prototype.showData = function() {
		
	var json = this.member.getData();	
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,haxapp.app.AceDataMode.formatString);
	}
	
    if(!this.editor) {
        var mode = this.doJsonFormatting ? "ace/mode/json" : "ace/mode/text";
        this.editor = new haxapp.app.AceTextEditor(this,mode);
    }
	this.editor.showData(textData,this.getIsDataEditable());
}

haxapp.app.AceDataMode.prototype.onSave = function(text) {
	
	
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
	var actionResponse =  hax.action.doAction(this.member.getWorkspace(),actionData);
	
	return true;
}
