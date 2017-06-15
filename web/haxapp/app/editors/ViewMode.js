/* This is a base class for a view mode. 
 * If the doKeepAlive flag is set to true the display will be maintained
 * after it is hidden. Otherwise it id destroyed when hidden. */
haxapp.app.ViewMode = function(componentDisplay, doKeepAlive) {
    this.componentDisplay = componentDisplay;
    this.doKeepAlive = doKeepAlive;
    this.component = componentDisplay.getComponent();
    this.member = this.component.getObject();
    
    this.dataDisplay = null;
    
    //this is to support editors that have a specila edit more (as opposed to inline editing)
    this.inEditMode = false;
}

//these are responses to hide request and close request
haxapp.app.ViewMode.UNSAVED_DATA = -1;
haxapp.app.ViewMode.CLOSE_OK = 0;

//------------------------------
// Accessed by the Component Display
//------------------------------

/** This is called immediately before the display element is shown. */
haxapp.app.ViewMode.prototype.showData = function() {
    if(!this.dataDisplay) {
        this.dataDisplay = this.createDisplay();
    }
    
    this.dataDisplay.showData(this.getDisplayData(),this.getIsDataEditable());
}

//Implement in extending classes - OPTIONAL
///** This is called immediately after the display element is shown. This method may be omitted. */
haxapp.app.ViewMode.prototype.dataShown = function() {
    if(this.dataDisplay.dataShown) {
        this.dataDisplay.dataShown();
    }
}

/** This method is called before the view mode is hidden. It should
 * return true or false. */
haxapp.app.ViewMode.prototype.requestHide = function() {
    if(this.dataDisplay) {
        if(this.inEditMode) {
            return haxapp.app.ViewMode.UNSAVED_DATA;
        }
    }
    
    return haxapp.app.ViewMode.CLOSE_OK;
}

/** This method is caleld when the view mode is hidden. */
haxapp.app.ViewMode.prototype.hide = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.hide) {
            this.dataDisplay.hide();
        }
        //if we do not keep alive, kill the data display
        if(!this.doKeepAlive) {
            if(this.dataDisplay.destroy) {
                this.dataDisplay.destroy();
            }
            this.dataDisplay = null;
        }
    }
}

/** This method is called when the member is updated. */
haxapp.app.ViewMode.prototype.memberUpdated = function() {
    if((this.dataDisplay)&&(!this.inEditMode)) {
        this.showData();
    }
}

haxapp.app.ViewMode.prototype.getElement = function() {
    if(this.dataDisplay) {
        return this.dataDisplay.getElement();
    }
    else {
        return null;
    }
}

haxapp.app.ViewMode.prototype.destroy = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.destroy) {
            this.dataDisplay.destroy();
        }
        this.dataDisplay = null;
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

///** This method creates the data display object. */
//haxapp.app.ViewMode.prototype.createDisplay = function();

///** This method gets the data to display in the data display object. */
//haxapp.app.ViewMode.prototype.getDisplayData = function();

/** This method returns true if the data should be editable. */
//haxapp.app.ViewMode.prototype.getIsDataEditable = function();

