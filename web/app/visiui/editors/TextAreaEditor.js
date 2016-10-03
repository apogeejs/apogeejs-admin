/** Editor that uses the Ace text editor.
 * 
 * @param {type} component - the hax component
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
hax.app.visiui.TextAreaEditor = function(component,onSave,onCancel) {
    
    this.outsideDiv = hax.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	var textArea = hax.visiui.createElement("TEXTAREA",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "height":"100%",
		"overflow":"auto",
        
        "webkitUserSelect":"none",
        "khtmlUserSelect":"none",
        "mozUserSelect":"none",
        "msUserSelect":"none",
        "userSelect":"none"
	});
    this.textArea = textArea;
    this.textArea.readOnly = true;
    this.outsideDiv.appendChild(this.textArea);
    
    var onFocus = function () {
        hax.visiui.applyStyle(textArea,hax.app.visiui.TextAreaEditor.selectStyle);
    }
    this.textArea.addEventListener("focus",onFocus);
    var onBlur = function () {
        hax.visiui.applyStyle(textArea,hax.app.visiui.TextAreaEditor.noSelectStyle);
    }
    this.textArea.addEventListener("blur",onBlur);
    
	
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
	
//    hax.visiui.setResizeListener(this.outsideDiv, resizeCallback);
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.textArea.addEventListener("click",onMouseClick);
}

hax.app.visiui.TextAreaEditor.noSelectStyle = {
    "webkitUserSelect":"none",
    "khtmlUserSelect":"none",
    "mozUserSelect":"none",
    "msUserSelect":"none",
    "userSelect":"none"
};
hax.app.visiui.TextAreaEditor.selectStyle = {
    "webkitUserSelect":"text",
    "khtmlUserSelect":"text",
    "mozUserSelect":"text",
    "msUserSelect":"text",
    "userSelect":"text"
};

hax.app.visiui.TextAreaEditor.prototype.save = function() {
	
	var text = this.textArea.value;
	
	var saveComplete = this.parentSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

hax.app.visiui.TextAreaEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.parentCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

hax.app.visiui.TextAreaEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
hax.app.visiui.TextAreaEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
    this.textArea.readOnly = !editOk;
	this.textArea.value = text;
    
    //set the background color
    if(this.editOk) {
        this.textArea.style.backgroundColor = "";
    }
    else {
        this.textArea.style.backgroundColor = hax.app.visiui.TableEditComponent.NO_EDIT_BACKGROUND_COLOR;
    }
    
}

hax.app.visiui.TextAreaEditor.prototype.destroy = function() {
}

//==============================
// Private Methods
//==============================

/** @private */
hax.app.visiui.TextAreaEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.textArea.readOnly = true;
	this.component.hideSaveBar();
}

/** @private */
hax.app.visiui.TextAreaEditor.prototype.onMouseClick = function() {
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


