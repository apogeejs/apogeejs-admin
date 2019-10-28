/* This is the interface needed for a DisplayContainer. This file is only for documentation's sake for now. */
apogeeapp.app.DisplayContainer = class {

    //------------------------------
    // accessors
    //------------------------------

    /** The displayDestroyFlags indicate when the display for this view mode will be destroyed,
     * refering to times it is not visible to the user. See further notes in the constructor
     * description. */
    //apogeeapp.app.DisplayContainer.prototype.setDisplayDestroyFlags = function(displayDestroyFlags);
    
    /** This method cleasr the data display. It should only be called when the data display is not showing. */
    //apogeeapp.app.DisplayContainer.prototype.forceClearDisplay = function();

    //------------------------------
    // life cycle - show hide update
    //------------------------------

    /** This method shows the data display ion the display component. */
    //apogeeapp.app.DisplayContainer.prototype.setActive = function();

    /** This method hides the data display in the display component. */
    //apogeeapp.app.DisplayContainer.prototype.setInactive = function();

    /** This method destroys the data display. */
    //apogeeapp.app.DisplayContainer.prototype.destroy = function();

    /** This method should be called called before the view mode is closed. It should
     * return true or false. NO - IT RETURNS SOMETHING ELSE! FIX THIS! */
    //apogeeapp.app.DisplayContainer.prototype.isCloseOk = function();

    /** This method is called when the member is updated, to make sure the 
     * data display is up to date. */
    //apogeeapp.app.DisplayContainer.prototype.memberUpdated = function();

    //------------------------------
    // Accessed by the Editor, if applicable
    //------------------------------

    /** This methods returns the data display to non-edit mode, restoring the previous data. */
    //apogeeapp.app.DisplayContainer.prototype.onCancel = function();

    /** This method opens starts edit mode and opens the save bar. */
    //apogeeapp.app.DisplayContainer.prototype.startEditMode = function(onSave,onCancel);

    /** This method closes the edit mode save bar. */
    //apogeeapp.app.DisplayContainer.prototype.endEditMode = function();

    /** This method returns true if the data display is in edit mode. */
    //apogeeapp.app.DisplayContainer.prototype.isInEditMode = function();

}

//modify these
////these are responses to hide request and close request
apogeeapp.app.DisplayContainer.UNSAVED_DATA = -1;
apogeeapp.app.DisplayContainer.CLOSE_OK = 1;

apogeeapp.app.DisplayContainer.VIEW_STATE_INACTIVE = 1;
apogeeapp.app.DisplayContainer.VIEW_STATE_MINIMIZED = 2; //get rid of this

//some common cases - made of the view state flags
apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_NEVER = 0;
apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_INACTIVE = 1;
//apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_HIDDEN = 2; //meaning parent hidden. leave this out?