/* This is a base class for a view mode. */
apogeeapp.app.ViewMode = function(componentDisplay, viewType) {
    this.componentDisplay = componentDisplay;
    
    //for destroying display to save resources
/* displayDestroy flags determine the cases under which the data display
 * will be destroyed (or kept alive). The options are when the display mode
 * is not active, when the window is minimized, and when the parent display
 * is hidden (such as the tab parent for a window). Before the display is destroyed,
 * a check is done to make sure it is ok, such as it is not in edit mode. */
    this.setDisplayDestroyFlags(apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
    
    //data display
    this.viewType = viewType;
    this.dataDisplay = null;
    this.modeActive = false;
    this.displayInWindow = false;
    
    //this is to support editors that have a specila edit more (as opposed to inline editing)
    this.inEditMode = false; 
    
    //window state, and listener for changes to window state (minimize/restore)
    var window = componentDisplay.getDisplayFrame();
    this.windowMinimized = (window.getWindowState() == apogeeapp.ui.WINDOW_STATE_MINIMIZED);
    window.addListener(apogeeapp.ui.WINDOW_STATE_CHANGED,(window) => (this.onWindowStateChange(window)) );
    
    //add a listener for window showing/hidden
    this.windowLoaded = window.getIsShowing();
    window.addListener(apogeeapp.ui.SHOWN_EVENT, () => (this.onWindowLoaded()) );
    window.addListener(apogeeapp.ui.HIDDEN_EVENT, () => (this.onWindowUnloaded()) );
    
    //add resize event
    window.addListener(apogeeapp.ui.RESIZED_EVENT, () => (this.onWindowResized()) );
}

//these are responses to hide request and close request
apogeeapp.app.ViewMode.UNSAVED_DATA = -1;
apogeeapp.app.ViewMode.CLOSE_OK = 0;

apogeeapp.app.ViewMode.VIEW_STATE_INACTIVE = 1;
apogeeapp.app.ViewMode.VIEW_STATE_MINIMIZED = 2;

//some common cases - made of the view state flags
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER = 0;
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE = 1;
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED = 3;


//------------------------------
// accessors
//------------------------------

/** This returns the UiObject, such as the window frame for this data display. */
apogeeapp.app.ViewMode.prototype.getDisplayWindow = function() {
    return this.componentDisplay.getDisplayFrame();
}

apogeeapp.app.ViewMode.prototype.getElement = function() {
    if(this.dataDisplay) {
        return this.dataDisplay.getContent();
    }
    else {
        return null;
    }
}

/** The displayDestroyFlags indicate when the display for this view mode will be destroyed,
 * refering to times it is not visible to the user. See further notes in the constructor
 * description. */
apogeeapp.app.ViewMode.prototype.setDisplayDestroyFlags = function(displayDestroyFlags) {
    this.destroyOnInactive = ((displayDestroyFlags & apogeeapp.app.ViewMode.VIEW_STATE_INACTIVE) != 0);
    this.destroyOnMinimize = ((displayDestroyFlags & apogeeapp.app.ViewMode.VIEW_STATE_MINIMIZED) != 0);
}

/** This method cleasr the data display. It should only be called when the data display is not showing. */
apogeeapp.app.ViewMode.prototype.forceClearDisplay = function() {
    this.destroyDataDisplay();
}

//------------------------------
// life cycle - show hide update
//------------------------------

/** This is called immediately before the display element is shown. */
apogeeapp.app.ViewMode.prototype.setActive = function() {
    this.modeActive = true;
    this.setDisplayState();
}

/** This method is caleld when the view mode is hidden. */
apogeeapp.app.ViewMode.prototype.setInactive = function() {
    this.modeActive = false;
    this.setDisplayState();
}

apogeeapp.app.ViewMode.prototype.destroy = function() {
    this.destroyDataDisplay();
}

/** This method is called before the view mode is hidden. It should
 * return true or false. */
apogeeapp.app.ViewMode.prototype.isCloseOk = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.isCloseOk) {
            return this.dataDisplay.isCloseOk();
        }
        
        if(this.inEditMode) {
            return apogeeapp.app.ViewMode.UNSAVED_DATA;
        }
    }
    
    return apogeeapp.app.ViewMode.CLOSE_OK;
}

/** This method is called when the member is updated. */
apogeeapp.app.ViewMode.prototype.memberUpdated = function() {
    if((this.dataDisplay)&&(!this.inEditMode)) {
        this.setData();
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
	this.setData();
	
	return true;
}

apogeeapp.app.ViewMode.prototype.startEditMode = function(onSave,onCancel) {
    if(!this.inEditMode) {
        this.inEditMode = true;
        this.componentDisplay.startEditUI(onSave,onCancel);
    }
}

apogeeapp.app.ViewMode.prototype.endEditMode = function() {
    if(this.inEditMode) {
        this.inEditMode = false;
        this.componentDisplay.endEditUI();
    }
}

//-----------------------------------
// Private
//-----------------------------------

/** Handles minimize/restore/maximize event on window - checks if we need to create or destroy the display. */
apogeeapp.app.ViewMode.prototype.onWindowStateChange = function(window) {
    this.windowMinimized = (window.getWindowState() == apogeeapp.ui.WINDOW_STATE_MINIMIZED);
    this.setDisplayState();
}

apogeeapp.app.ViewMode.prototype.onWindowLoaded = function() {
    this.windowLoaded = true;
    if((this.dataDisplay)&&(this.dataDisplay.onLoad)) {
        this.dataDisplay.onLoad();
    }
}

apogeeapp.app.ViewMode.prototype.onWindowUnloaded = function() {
    this.windowLoaded = false;
    if((this.dataDisplay)&&(this.dataDisplay.onUnload)) {
        this.dataDisplay.onUnload();
    }
}

apogeeapp.app.ViewMode.prototype.onWindowResized = function() {
    if((this.dataDisplay)&&(this.displayInWindow)&&(this.dataDisplay.onResize)) {
        this.dataDisplay.onResize();
    }
}

apogeeapp.app.ViewMode.prototype.setData = function() {
    this.dataDisplay.showData();
}

/** If we enter a state where we want to destroy the display, try to do that. */
apogeeapp.app.ViewMode.prototype.setDisplayState = function() {
    var destroyWindow = (((!this.modeActive) && this.destroyOnInactive)||(this.windowMinimized && this.destroyOnMinimize));
    var showWindow = destroyWindow ? false : this.modeActive;
 
    if(showWindow) {
        //show window, maybe create
        if(!this.dataDisplay) {
            this.dataDisplay = this.componentDisplay.getDataDisplay(this,this.viewType);
            this.placeDisplayInWindow();
            this.setData();
        }
        else if(!this.displayInWindow) {
            this.placeDisplayInWindow();
        }
    }
    else {
        //hide window, maybe destroy
        if(this.dataDisplay) {
            if(this.displayInWindow) {
                this.removeDisplayfromWindow();
            }
            
            if(destroyWindow) {
                //destroy display, but only is hidine is ok
                if(this.isCloseOk() === apogeeapp.app.ViewMode.CLOSE_OK) {
                    this.destroyDataDisplay();
                }
            }
        }
    }
}

apogeeapp.app.ViewMode.prototype.placeDisplayInWindow = function() {
    if(this.dataDisplay) {
        this.componentDisplay.showDataDisplay(this.dataDisplay);
        if((this.windowLoaded)&&(this.dataDisplay.onLoad)) this.dataDisplay.onLoad();
        this.displayInWindow = true;
    }
}

apogeeapp.app.ViewMode.prototype.removeDisplayfromWindow = function() {
    if(this.dataDisplay) {
        this.componentDisplay.removeDisplayElement(this.dataDisplay.getContent());
        if((this.windowLoaded)&&(this.dataDisplay.onUnload)) this.dataDisplay.onUnload();
        this.displayInWindow = false;
    }
}

/** If we enter a state where we want to destroy the display, try to do that. */
apogeeapp.app.ViewMode.prototype.destroyDataDisplay = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.destroy) this.dataDisplay.destroy();
        this.dataDisplay = null;
    }
}