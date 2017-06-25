

apogeeapp.app.AceCustomControlMode = function(componentDisplay,codeField) {
    apogeeapp.app.ViewMode.call(this,componentDisplay);
    this.component = componentDisplay.getComponent();
    this.codeField = codeField;
}

apogeeapp.app.AceCustomControlMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceCustomControlMode.prototype.constructor = apogeeapp.app.AceCustomControlMode;

apogeeapp.app.AceCustomControlMode.prototype.createDisplay = function() {
    var format;
    if(this.codeField === apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML) {
        format = "ace/mode/html";
    }
    else if(this.codeField === apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS) {
        format = "ace/mode/css";
    }
    else {
        format = "ace/mode/javascript";
    }
    return new apogeeapp.app.AceTextEditor(this,format);
}

apogeeapp.app.AceCustomControlMode.prototype.getDisplayData = function() {
    var uiCodeFields = this.component.getUiCodeFields();
    var data = uiCodeFields[this.codeField];
    if((data === undefined)||(data === null)) data = "";
    return data;
}

apogeeapp.app.AceCustomControlMode.prototype.getIsDataEditable = function() {
    return true;
}

apogeeapp.app.AceCustomControlMode.prototype.onSave = function(text) {
    
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
