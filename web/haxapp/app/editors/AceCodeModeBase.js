/** This is a base class for different code editors (this is not a mixin). */
haxapp.app.AceCodeModeBase = function(component,mode) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new haxapp.app.AceTextEditor(component,mode,onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
haxapp.app.AceCodeModeBase.prototype.isData = false;

haxapp.app.AceCodeModeBase.prototype.getElement = function() {
	return this.editor.getElement();
}

haxapp.app.AceCodeModeBase.prototype.getComponent = function() {
	return this.component;
}
	
//Implement this!
//haxapp.app.AceCodeModeBase.prototype.showData = function(editOk);

haxapp.app.AceCodeModeBase.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

//Implemn
//haxapp.app.AceCodeModeBase.prototype.onSave = function(text);

haxapp.app.AceCodeModeBase.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
