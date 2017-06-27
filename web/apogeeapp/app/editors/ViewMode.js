/* This is a base class for a view mode. 
 * If the doKeepAlive flag is set to true the display will be maintained
 * after it is hidden. Otherwise it id destroyed when hidden. */
apogeeapp.app.ViewMode = function(componentDisplay, doKeepAlive) {
    this.componentDisplay = componentDisplay;
    this.doKeepAlive = doKeepAlive;
    this.member = componentDisplay.getMember();
    
    this.dataDisplay = null;
    
    //this is to support editors that have a specila edit more (as opposed to inline editing)
    this.inEditMode = false;
}

//these are responses to hide request and close request
apogeeapp.app.ViewMode.UNSAVED_DATA = -1;
apogeeapp.app.ViewMode.CLOSE_OK = 0;

//------------------------------
// Accessed by the Component Display
//------------------------------

apogeeapp.app.ViewMode.prototype.getMember = function() {
    return this.member;
}

/** If doKeepAlive is set to true, the output mode is not destroyed when it is 
 * hidden. Otherwise it is destroyed when it is hidden and recreated nect time it
 * is shown. */
apogeeapp.app.ViewMode.prototype.setDoKeepAlive = function(doKeepAlive) {
    this.doKeepAlive = doKeepAlive;
}

/** This method cleasr the data display. It should only be called when the data display is not showing. */
apogeeapp.app.ViewMode.prototype.triggerReload = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.destroy) {
            this.dataDisplay.destroy();
        }
        this.dataDisplay = null;
    }
}

/** This is called immediately before the display element is shown. */
apogeeapp.app.ViewMode.prototype.showData = function() {
    if(!this.dataDisplay) {
        this.dataDisplay = this.createDisplay();
    }
    
    this.dataDisplay.showData(this.getDisplayData(),this.getIsDataEditable());
}

/** This method is called before the view mode is hidden. It should
 * return true or false. */
apogeeapp.app.ViewMode.prototype.requestHide = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.requestHide) {
            return this.dataDisplay.requestHide();
        }
        
        if(this.inEditMode) {
            return apogeeapp.app.ViewMode.UNSAVED_DATA;
        }
    }
    
    return apogeeapp.app.ViewMode.CLOSE_OK;
}

/** This method is caleld when the view mode is hidden. */
apogeeapp.app.ViewMode.prototype.hide = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.hide) {
            this.dataDisplay.hide();
        }
        
        //if we do not keep alive, kill the data display
        if(!this.doKeepAlive) {
            this.destroy();
        }
    }
}

/** This method is called when the member is updated. */
apogeeapp.app.ViewMode.prototype.memberUpdated = function() {
    if((this.dataDisplay)&&(!this.inEditMode)) {
        this.showData();
    }
}

apogeeapp.app.ViewMode.prototype.getElement = function() {
    if(this.dataDisplay) {
        return this.dataDisplay.getElement();
    }
    else {
        return null;
    }
}

apogeeapp.app.ViewMode.prototype.destroy = function() {
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
//apogeeapp.app.ViewMode.prototype.onSave = function(ARGUMENT TYPE DEPENDS ON EDITOR) {
//    
//}

apogeeapp.app.ViewMode.prototype.onCancel = function() {
	//reload old data
	this.showData();
	
	return true;
}

apogeeapp.app.ViewMode.prototype.startEditMode = function(onSave,onCancel) {
    this.inEditMode = true;
    this.componentDisplay.startEditUI(onSave,onCancel);
}

apogeeapp.app.ViewMode.prototype.endEditMode = function() {
    this.inEditMode = false;
    this.componentDisplay.endEditUI();
}

//------------------------------
// Protected
//------------------------------

///** This method creates the data display object. */
//apogeeapp.app.ViewMode.prototype.createDisplay = function();

///** This method gets the data to display in the data display object. */
//apogeeapp.app.ViewMode.prototype.getDisplayData = function();

/** This method returns true if the data should be editable. */
//apogeeapp.app.ViewMode.prototype.getIsDataEditable = function();

