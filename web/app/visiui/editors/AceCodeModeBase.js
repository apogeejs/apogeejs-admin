/** This is a base class for different code editors (this is not a mixin). */
hax.app.visiui.AceCodeModeBase = function(component,mode) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new hax.app.visiui.AceTextEditor(component,mode,onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
hax.app.visiui.AceCodeModeBase.prototype.isData = false;

hax.app.visiui.AceCodeModeBase.prototype.getElement = function() {
	return this.editor.getElement();
}

hax.app.visiui.AceCodeModeBase.prototype.getComponent = function() {
	return this.component;
}
	
//Implement this!
//hax.app.visiui.AceCodeModeBase.prototype.showData = function(editOk);

hax.app.visiui.AceCodeModeBase.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

//Implemn
//hax.app.visiui.AceCodeModeBase.prototype.onSave = function(text);

hax.app.visiui.AceCodeModeBase.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
