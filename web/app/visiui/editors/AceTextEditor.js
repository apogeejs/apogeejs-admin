/** Editor that uses the Ace text editor.
 * 
 * @param {type} component - the visicomp component
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
visicomp.app.visiui.AceTextEditor = function(component,aceMode,onSave,onCancel) {
    
    this.outsideDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	this.editorDiv = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    this.outsideDiv.appendChild(this.editorDiv);
	
	this.component = component;
	this.table = component.getObject();
	this.workingData = null;
	this.editOk = false;
	this.editMode = false;
	
	this.parentSave = onSave;
	this.parentCancel = onCancel;
	
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
	
    visicomp.visiui.setResizeListener(this.outsideDiv, resizeCallback);
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.editorDiv.addEventListener("click",onMouseClick);
}

visicomp.app.visiui.AceTextEditor.prototype.save = function() {
	
	var text = this.editor.getSession().getValue();
	
	var saveComplete = this.parentSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

visicomp.app.visiui.AceTextEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.parentCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

visicomp.app.visiui.AceTextEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
visicomp.app.visiui.AceTextEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
	this.editor.getSession().setValue(text);
}

visicomp.app.visiui.AceTextEditor.prototype.destroy = function() {
	if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

//==============================
// Private Methods
//==============================

/** @private */
visicomp.app.visiui.AceTextEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.editor.setReadOnly(true);
	this.component.hideSaveBar();
}

/** @private */
visicomp.app.visiui.AceTextEditor.prototype.onMouseClick = function() {
	if((this.editOk)&&(!this.editMode)) {
		
		var instance = this;
		var onSave = function() {
			instance.save();
		}
		var onCancel = function() {
			instance.cancel();
		}
		
		this.component.showSaveBar(onSave,onCancel);
		
		this.editor.setReadOnly(false);
		this.editMode = true;
	}
}
