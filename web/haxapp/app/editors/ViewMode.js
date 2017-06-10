/* This is a base class for a view mode. 
 * Note- the editor should be set when extending this class.*/
haxapp.app.ViewMode = function(componentDisplay) {
    this.componentDisplay = componentDisplay;
    this.component = componentDisplay.getComponent();
    this.member = this.component.getObject();
    
    this.editor = null;
    
    //this is to support editors that have a specila edit more (as opposed to inline editing)
    this.inEditMode = false;
}

//these are responses to hide request and close request
haxapp.app.ViewMode.UNSAVED_DATA = -1;
haxapp.app.ViewMode.CLOSE_OK = 0;

//------------------------------
// Accessed by the Component Display
//------------------------------

//Implement in extending classes
///** This is called immediately before the display element is shown. */
//haxapp.app.ViewMode.prototype.showData = function();

//Implement in extending classes - OPTIONAL
///** This is called immediately after the display element is shown. This method may be omitted. */
//haxapp.app.ViewMode.prototype.dataShown = function();

/** This method is called before the view mode is hidden. It should
 * return true or false. */
haxapp.app.ViewMode.prototype.requestHide = function() {
    if(this.editor) {
        if(this.inEditMode) {
            return haxapp.app.ViewMode.UNSAVED_DATA;
        }
    }
    
    return haxapp.app.ViewMode.CLOSE_OK;
}

/** This method is caleld when the view mode is hidden. */
haxapp.app.ViewMode.prototype.hide = function() {
    if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

/** This method is called when the member is updated. */
haxapp.app.ViewMode.prototype.memberUpdated = function() {
    if((this.editor)&&(!this.inEditMode)) {
        this.showData();
    }
}

haxapp.app.ViewMode.prototype.getElement = function() {
    if(this.editor) {
        return this.editor.getElement();
    }
    else {
        return null;
    }
}

haxapp.app.ViewMode.prototype.destroy = function() {
    if((this.editor)&&(this.editor.destroy)) {
        this.editor.destroy();
    }
}

//------------------------------
// Accessed by the Editor, if applicable
//------------------------------

//implement this in extending class if needed by an editor
//haxapp.app.ViewMode.prototype.onSave = function(ARGUMENT TYPE DEPENDS ON EDITOR) {
//    
//}

haxapp.app.ViewMode.prototype.onCancel = function() {
	//reload old data
	this.showData();
	
	return true;
}

haxapp.app.ViewMode.prototype.startEditMode = function(onSave,onCancel) {
    this.inEditMode = true;
    this.componentDisplay.startEditUI(onSave,onCancel);
}

haxapp.app.ViewMode.prototype.endEditMode = function() {
    this.inEditMode = false;
    this.componentDisplay.endEditUI();
}

//------------------------------
// Protected
//------------------------------

/** This is a convenience method that can be used by data objects.
 * It returns whether or not the given member has editable data.
 *  The data is not editable if there is code. A general view mode may
 *  not use this method, but use a hard code value internally instead.*/ 
haxapp.app.ViewMode.prototype.getIsDataEditable = function() {
    return !(this.member.hasCode());
}

