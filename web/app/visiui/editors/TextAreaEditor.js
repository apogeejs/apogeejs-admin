/** Editor that uses the Ace text editor.
 * 
 * @param {type} component - the visicomp component
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
visicomp.app.visiui.TextAreaEditor = function(component,onSave,onCancel) {
    
    this.outsideDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	this.textArea = visicomp.visiui.createElement("TEXTAREA",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "height":"100%",
		"overflow":"auto"
	});
    this.textArea.readOnly = true;
    this.outsideDiv.appendChild(this.textArea);
    
	
	this.component = component;
	this.table = component.getObject();
	this.workingData = null;
	this.editOk = false;
	this.editMode = false;
	
	this.parentSave = onSave;
	this.parentCancel = onCancel;
	
//	//resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
	
//    visicomp.visiui.setResizeListener(this.outsideDiv, resizeCallback);
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.textArea.addEventListener("click",onMouseClick);
}

visicomp.app.visiui.TextAreaEditor.prototype.save = function() {
	
	var text = this.textArea.value;
	
	var saveComplete = this.parentSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

visicomp.app.visiui.TextAreaEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.parentCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

visicomp.app.visiui.TextAreaEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
visicomp.app.visiui.TextAreaEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
    this.textArea.readOnly = !editOk;
	this.textArea.value = text;
    
    //set the background color
    if(this.editOk) {
        this.textArea.style.backgroundColor = "";
    }
    else {
        this.textArea.style.backgroundColor = visicomp.app.visiui.TableEditComponent.NO_EDIT_BACKGROUND_COLOR;
    }
    
}

visicomp.app.visiui.TextAreaEditor.prototype.destroy = function() {
}

//==============================
// Private Methods
//==============================

/** @private */
visicomp.app.visiui.TextAreaEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.textArea.readOnly = true;
	this.component.hideSaveBar();
}

/** @private */
visicomp.app.visiui.TextAreaEditor.prototype.onMouseClick = function() {
	if((this.editOk)&&(!this.editMode)) {
		
		var instance = this;
		var onSave = function() {
			instance.save();
		}
		var onCancel = function() {
			instance.cancel();
		}
		
		this.component.showSaveBar(onSave,onCancel);
		
		this.textArea.readOnly = false;
		this.editMode = true;
	}
}


