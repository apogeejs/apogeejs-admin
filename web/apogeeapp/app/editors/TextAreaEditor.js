/** Editor that uses the basic text editor */
apogeeapp.app.TextAreaEditor = function(viewMode) {
    
    this.outsideDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	var textArea = apogeeapp.ui.createElement("TEXTAREA",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "height":"100%",
		"overflow":"auto"
	});
    this.textArea = textArea;
    this.textArea.readOnly = true;
    this.outsideDiv.appendChild(this.textArea);  
	
	this.viewMode = viewMode;
	this.workingData = null;
	this.editOk = false;
	this.editMode = false;
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.textArea.addEventListener("click",onMouseClick);
}

apogeeapp.app.TextAreaEditor.prototype.save = function() {
	
	var text = this.textArea.value;
	
	var saveComplete = this.viewMode.onSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

apogeeapp.app.TextAreaEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.viewMode.onCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

apogeeapp.app.TextAreaEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
apogeeapp.app.TextAreaEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
    this.textArea.readOnly = !editOk;
	this.textArea.value = text;
    
    //set the background color
    if(this.editOk) {
        this.textArea.style.backgroundColor = "";
    }
    else {
        this.textArea.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
    
}

apogeeapp.app.TextAreaEditor.prototype.destroy = function() {
}

//==============================
// Private Methods
//==============================

/** @private */
apogeeapp.app.TextAreaEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.textArea.readOnly = true;
	this.viewMode.endEditMode();
}

/** @private */
apogeeapp.app.TextAreaEditor.prototype.onMouseClick = function() {
	if((this.editOk)&&(!this.editMode)) {
		
		var instance = this;
		var onSave = function() {
			instance.save();
		}
		var onCancel = function() {
			instance.cancel();
		}
		
		this.viewMode.startEditMode(onSave,onCancel);
		
		this.textArea.readOnly = false;
		this.editMode = true;
	}
}


