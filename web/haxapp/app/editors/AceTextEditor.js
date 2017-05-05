/** Editor that uses the Ace text editor.
 * 
 * @param {type} componentDisplay - the hax componentDisplay
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
haxapp.app.AceTextEditor = function(viewMode,aceMode) {
    
    this.outsideDiv = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	this.editorDiv = haxapp.ui.createElement("div",null,{
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
    var resizeCallback = function() {
        editor.resize();
    }
	
    haxapp.ui.setResizeListener(this.outsideDiv, resizeCallback);
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.editorDiv.addEventListener("click",onMouseClick);
}

haxapp.app.AceTextEditor.prototype.save = function() {
	
	var text = this.editor.getSession().getValue();
	
	var saveComplete = this.viewMode.onSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

haxapp.app.AceTextEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.viewMode.onCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

haxapp.app.AceTextEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
haxapp.app.AceTextEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
	this.editor.getSession().setValue(text);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = haxapp.app.WindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
    
}

haxapp.app.AceTextEditor.prototype.destroy = function() {
	if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

//==============================
// Private Methods
//==============================

/** @private */
haxapp.app.AceTextEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.editor.setReadOnly(true);
	this.viewMode.endEditMode();
}

/** @private */
haxapp.app.AceTextEditor.prototype.onMouseClick = function() {
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
