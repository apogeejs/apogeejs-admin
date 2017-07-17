/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */
apogeeapp.app.AceTextEditor = function(viewMode,aceMode) {
    
    this.outsideDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	this.editorDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    this.outsideDiv.appendChild(this.editorDiv);
	
	this.viewMode = viewMode;
	this.workingData = null;
	this.editOk = false;
	this.editMode = false;
	
	
	var editor = ace.edit(this.editorDiv);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode(aceMode); 
	editor.$blockScrolling = Infinity;
    this.editor = editor;
	
	//resize the editor on window size change
    this.resizeCallback = function() {
        editor.resize();
    }
    this.callbackAttached = false;
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.editorDiv.addEventListener("click",onMouseClick);
}

apogeeapp.app.AceTextEditor.prototype.save = function() {
	
	var text = this.editor.getSession().getValue();
	
	var saveComplete = this.viewMode.onSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

apogeeapp.app.AceTextEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.viewMode.onCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

apogeeapp.app.AceTextEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
apogeeapp.app.AceTextEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
	this.editor.getSession().setValue(text);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
    
    if(!this.callbackAttached) {
        var uiObject = this.viewMode.getUiObject();
        if(uiObject) {
            uiObject.addListener(apogeeapp.ui.RESIZED_EVENT,this.resizeCallback);
            this.callbackAttached = true;
        }
    }
    
    //call resize to make sure size is initialized
    this.resizeCallback();
    
}

apogeeapp.app.AceTextEditor.prototype.hide = function() {
    var uiObject = this.viewMode.getUiObject();
    if(uiObject) {
        uiObject.removeListener(apogeeapp.ui.RESIZED_EVENT,this.resizeCallback);
        this.callbackAttached = false;
    }
}

apogeeapp.app.AceTextEditor.prototype.destroy = function() {
	if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

//==============================
// Private Methods
//==============================

/** @private */
apogeeapp.app.AceTextEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.editor.setReadOnly(true);
	this.viewMode.endEditMode();
}

/** @private */
apogeeapp.app.AceTextEditor.prototype.onMouseClick = function() {
	if((this.editOk)&&(!this.editMode)) {
		
		var instance = this;
		var onSave = function() {
			instance.save();
		}
		var onCancel = function() {
			instance.cancel();
		}
		
		this.viewMode.startEditMode(onSave,onCancel);
		
		this.editor.setReadOnly(false);
		this.editMode = true;
	}
}
