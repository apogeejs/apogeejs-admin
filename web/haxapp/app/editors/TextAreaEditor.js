/** Editor that uses the Ace text editor.
 * 
 * @param {type} componentDisplay - the hax componentDisplay
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
haxapp.app.TextAreaEditor = function(viewMode) {
    
    this.outsideDiv = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	var textArea = haxapp.ui.createElement("TEXTAREA",null,{
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
	
//	//resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
	
//    haxapp.ui.setResizeListener(this.outsideDiv, resizeCallback);
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.textArea.addEventListener("click",onMouseClick);
}

haxapp.app.TextAreaEditor.prototype.save = function() {
	
	var text = this.textArea.value;
	
	var saveComplete = this.viewMode.onSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

haxapp.app.TextAreaEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.viewMode.onCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

haxapp.app.TextAreaEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
haxapp.app.TextAreaEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
    this.textArea.readOnly = !editOk;
	this.textArea.value = text;
    
    //set the background color
    if(this.editOk) {
        this.textArea.style.backgroundColor = "";
    }
    else {
        this.textArea.style.backgroundColor = haxapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
    
}

haxapp.app.TextAreaEditor.prototype.destroy = function() {
}

//==============================
// Private Methods
//==============================

/** @private */
haxapp.app.TextAreaEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.textArea.readOnly = true;
	this.viewMode.endEditMode();
}

/** @private */
haxapp.app.TextAreaEditor.prototype.onMouseClick = function() {
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


