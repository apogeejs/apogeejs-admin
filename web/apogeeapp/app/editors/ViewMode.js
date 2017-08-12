/* This is a base class for a view mode. 
 * If the doKeepAlive flag is set to true the display will be maintained
 * after it is hidden. Otherwise it id destroyed when hidden. */
apogeeapp.app.ViewMode = function(componentDisplay, displayDestroyFlags) {
    this.componentDisplay = componentDisplay;
    this.member = componentDisplay.getMember();
    
    this.dataDisplay = null;
    
    //this is to support editors that have a specila edit more (as opposed to inline editing)
    this.inEditMode = false;
    
    //for destroying display to save resources
    this.displayDestroyFlags = displayDestroyFlags;
    this.viewStateFlags = apogeeapp.app.ViewMode.VIEW_STATE_INACTIVE;
    
    //set flag for window state
    this.onWindowStateChange(componentDisplay.getWindowFrame());
    
    //set flat for showing/hidden - DON'T CURRRENTLY HAVE THIS INFO AVAILABLE!
    //assume window is not hidden
    
}

//these are responses to hide request and close request
apogeeapp.app.ViewMode.UNSAVED_DATA = -1;
apogeeapp.app.ViewMode.CLOSE_OK = 0;

apogeeapp.app.ViewMode.VIEW_STATE_INACTIVE = 1;
apogeeapp.app.ViewMode.VIEW_STATE_MINIMIZED = 2;
apogeeapp.app.ViewMode.VIEW_STATE_HIDDEN = 4;

//some common cases - made of the view state flags
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER = 0;
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE = 1;
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED = 3;


//------------------------------
// Accessed by the Component Display
//------------------------------

apogeeapp.app.ViewMode.prototype.getMember = function() {
    return this.member;
}

/** This returns the UiObject, such as the window frame for this data display. */
apogeeapp.app.ViewMode.prototype.getDisplayWindow = function() {
    return this.componentDisplay.getWindowFrame();
}



/** The displayDestroyFlags indicate when the display for this view mode will be destroyed,
 * refering to times it is not visible to the user. */
apogeeapp.app.ViewMode.prototype.setDisplayDestroyFlags = function(displayDestroyFlags) {
    this.displayDestroyFlags = displayDestroyFlags;
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
    this.clearViewStateFlag(apogeeapp.app.ViewMode.VIEW_STATE_INACTIVE);
    this.checkPopulateDisplay();
    
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
        
        this.setViewStateFlag(apogeeapp.app.ViewMode.VIEW_STATE_INACTIVE); 
        this.checkDestroyDisplay();
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
    this.destroyDataDisplay();
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

//-----------------------------------
// Private
//-----------------------------------

apogeeapp.app.ViewMode.prototype.setViewStateFlag = function(viewStateFlag) {
    this.viewStateFlags |= viewStateFlag;
}

apogeeapp.app.ViewMode.prototype.clearViewStateFlag = function(viewStateFlag) {
    this.viewStateFlags &= ~viewStateFlag;
}

apogeeapp.app.ViewMode.prototype.getViewStateForFlag = function(viewStateFlag) {
    return ((this.viewStateFlags |= ~viewStateFlag) !== 0);
}

/** This method adds needed listeners to the data display window. */
apogeeapp.app.ViewMode.prototype.addWindowListeners = function() {
    if(!this.dataDisplay) return;
    
    var window = this.getDisplayWindow();
    var instance = this;

    //add window event listeners
    var onWindowStateChange = function(window) {
        instance.onWindowStateChange(window);
    }
    window.addListener(apogeeapp.ui.WINDOW_STATE_CHANGED,onWindowStateChange);

    var onWindowShown = function(window) {
        instance.onWindowShown(window);
    }
    window.addListener(apogeeapp.ui.SHOWN_EVENT,onWindowShown);

    var onWindowHidden = function(window) {
        instance.onWindowHidden(window);
    }
    window.addListener(apogeeapp.ui.HIDDEN_EVENT,onWindowHidden);
}

/** Handles minimize/restore/maximize event on window. */
apogeeapp.app.ViewMode.prototype.onWindowStateChange = function(window) {
    var windowState = window.getWindowState();
    if(windowState == apogeeapp.ui.WINDOW_STATE_MINIMIZED) {
        this.setViewStateFlag(apogeeapp.app.ViewMode.VIEW_STATE_MINIMIZED);
        this.checkDestroyDisplay();
    }
    else {
        this.clearViewStateFlag(apogeeapp.app.ViewMode.VIEW_STATE_MINIMIZED);
        this.checkPopulateDisplay();
    }
}

/** Handles window hidden event on window. */
apogeeapp.app.ViewMode.prototype.onWindowHidden = function() {
    this.setViewStateFlag(apogeeapp.app.ViewMode.VIEW_STATE_HIDDEN);
    this.checkDestroyDisplay();
}

/** Handles window shown event on window. */
apogeeapp.app.ViewMode.prototype.onWindowShown = function() {
    this.clearViewStateFlag(apogeeapp.app.ViewMode.VIEW_STATE_HIDDEN);
    this.checkPopulateDisplay();
}

/** If we enter a state where we want to destroy the display, try to do that. */
apogeeapp.app.ViewMode.prototype.checkDestroyDisplay = function() {
    if( (this.dataDisplay)&&((this.viewStateFlags & this.displayDestroyFlags) !== 0)) {
        //destroy, if possible
        //check if anything prevents us from hiding - this also serves for destroy
        if(this.requestHide() === apogeeapp.app.ViewMode.CLOSE_OK) {
            this.destroyDataDisplay();
        }
    }
}

/** Check for cases where we should reconstruct the display. */
apogeeapp.app.ViewMode.prototype.checkPopulateDisplay = function() {
    if( (!this.dataDisplay)&&((this.viewStateFlags & this.displayDestroyFlags) === 0)) {
        //create a new data display
        this.populateDataDisplay();
    }
}

apogeeapp.app.ViewMode.prototype.populateDataDisplay = function() {
    if(!this.dataDisplay) {
        this.dataDisplay = this.createDisplay();   
        this.addWindowListeners();
    }
    
    this.dataDisplay.showData(this.getDisplayData(),this.getIsDataEditable());
}

apogeeapp.app.ViewMode.prototype.destroyDataDisplay = function() {
    if(this.dataDisplay) {
        
        //destroy display
        if(this.dataDisplay.destroy) {  
            this.dataDisplay.destroy();
        }
        this.dataDisplay = null;
    }
}