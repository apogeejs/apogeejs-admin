

haxapp.app.AceCustomControlMode = function(componentDisplay,codeField) {
    haxapp.app.ViewMode.call(this,componentDisplay);
    this.component = componentDisplay.getComponent();
    this.codeField = codeField;
}

haxapp.app.AceCustomControlMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceCustomControlMode.prototype.constructor = haxapp.app.AceCustomControlMode;

haxapp.app.AceCustomControlMode.prototype.createDisplay = function() {
    var format;
    if(this.codeField === haxapp.app.NewCustomControlComponent.CODE_FIELD_HTML) {
        format = "ace/mode/html";
    }
    else if(this.codeField === haxapp.app.NewCustomControlComponent.CODE_FIELD_CSS) {
        format = "ace/mode/css";
    }
    else {
        format = "ace/mode/javascript";
    }
    return new haxapp.app.AceTextEditor(this,format);
}

haxapp.app.AceCustomControlMode.prototype.getDisplayData = function() {
    var uiCodeFields = this.component.getUiCodeFields();
    var data = uiCodeFields[this.codeField];
    if((data === undefined)||(data === null)) data = "";
    return data;
}

haxapp.app.AceCustomControlMode.prototype.getIsDataEditable = function() {
    return true;
}

haxapp.app.AceCustomControlMode.prototype.onSave = function(text) {
    
    var uiCodeFields = this.component.getUiCodeFields();
    
    //overwrite the edit field
    uiCodeFields[this.codeField] = text;
	
	var actionResponse = this.component.update(uiCodeFields);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
