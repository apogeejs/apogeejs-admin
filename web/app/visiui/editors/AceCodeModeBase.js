/** This is a base class for different code editors (this is not a mixin). */
visicomp.app.visiui.AceCodeModeBase = function(component,mode) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new visicomp.app.visiui.AceTextEditor(component,mode,onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
visicomp.app.visiui.AceCodeModeBase.prototype.isData = false;

visicomp.app.visiui.AceCodeModeBase.prototype.getElement = function() {
	return this.editor.getElement();
}

visicomp.app.visiui.AceCodeModeBase.prototype.getComponent = function() {
	return this.component;
}
	
//Implement this!
//visicomp.app.visiui.AceCodeModeBase.prototype.showData = function(editOk);

visicomp.app.visiui.AceCodeModeBase.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

//Implemn
//visicomp.app.visiui.AceCodeModeBase.prototype.onSave = function(text);

visicomp.app.visiui.AceCodeModeBase.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
