/* This is a base class for a view mode. 
 * Note- the editor should be set when extending this class.*/
haxapp.app.ViewMode = function(componentDisplay,isData) {
    this.componentDisplay = componentDisplay;
    this.componnent = componentDisplay.getComponent();
    this.member = componentDisplay.getObject();
    this.isData = isData;
    
}


//------------------------------
// Accessed by the Component Display
//------------------------------

//implement this in extending class
//haxapp.app.ViewMode.prototype.showData = function() {
//}

haxapp.app.ViewMode.prototype.getElement = function() {
	return this.editor.getElement();
}

haxapp.app.ViewMode.prototype.destroy = function() {
    if(this.editor.destroy) {
        this.editor.destroy();
    }
}

//------------------------------
// Accessed by the Editor
//------------------------------

//implement this in extending class
//haxapp.app.ViewMode.prototype.onSave = function(ARGUMENT TYPE DEPENDS ON EDITOR) {
//    
//}

haxapp.app.ViewMode.prototype.onCancel = function() {
	//reload old data
	this.showData();
	
	return true;
}

haxapp.app.ViewMode.prototype.startEditUI = function(onSave,onCancel) {
    this.componentDisplay.startEditUI(onSave,onCancel);
}

haxapp.app.ViewMode.prototype.endEditUI = function() {
    this.componentDisplay.endEditUI();
}

//========================
// protected
//========================

/** This method should be used to determine if the element should be editable. 
 * @protected */
haxapp.app.ViewMode.prototype.getIsEditable = function() {
    return ((!this.isData)||(!this.member.hasCode()));
}

haxapp.app.ViewMode.prototype.setEditor = function(editor) {
	this.editor = editor;
}




