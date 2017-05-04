
haxapp.app.AceDataMode = function(componentDisplay,doJsonFormatting) {
	haxapp.app.ViewMode.call(this,componentDisplay,true);
	
    var mode = doJsonFormatting ? "ace/mode/json" : "ace/mode/text";
	this.setEditor(new haxapp.app.AceTextEditor(this,mode));
}

haxapp.app.AceDataMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceDataMode.prototype.constructor = haxapp.app.AceDataMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.AceDataMode.formatString = "\t";

haxapp.app.AceDataMode.prototype.showData = function() {
		
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
		textData = JSON.stringify(json,null,haxapp.app.AceDataMode.formatString);
	}
	
	this.editor.showData(textData,this.getIsEditable());
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
	
	var table = this.componentDisplay.getObject();
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = table;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
