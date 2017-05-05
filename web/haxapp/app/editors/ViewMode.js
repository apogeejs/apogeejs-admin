/* This is a base class for a view mode. 
 * Note- the editor should be set when extending this class.*/
haxapp.app.ViewMode = function(componentDisplay) {
    this.componentDisplay = componentDisplay;
    this.component = componentDisplay.getComponent();
    this.member = componentDisplay.getObject();
    
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
///** This is called to show the editor window. */
//haxapp.app.ViewMode.prototype.showData = function();

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

/** This method returns whether or not the given member has editable data.
 *  The data is not editable if there is code. */ 
haxapp.app.ViewMode.prototype.getIsDataEditable = function(member) {
    return !(member.hasCode());
}

