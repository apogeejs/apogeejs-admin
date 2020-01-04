import apogeeui from "/apogeeapp/ui/apogeeui.js";

/** Editor that uses the Ace text editor.
 * 
 * @param {type} displayContainer - this is the ui container that will show the display
 * @param {type} callbacks - the callbacks for the editor {getData,getEditOk,saveData}
 * @param {type} containerClass - the is the css class for the display container OPTIONAL
 */
export default class DataDisplay {
    constructor(displayContainer,callbacks) {
        this.displayContainer = displayContainer;
        this.callbacks = callbacks;
        this.editOk = false;
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }
    
    save() {
        var data = this.getData();
        var saveComplete;
        
        //figure out if there is a problem with this - we hav to end edit mode before
        //we save because in edit mode it will not overwrite the data in the display
        //if we fail, we restart edit mode below
        this.endEditMode();

        if((this.callbacks)&&(this.callbacks.saveData)) {
            saveComplete = this.callbacks.saveData(data);
        }
        else {
            alert("Error: Data not saved: save callback not set!");
            saveComplete = true;
        }

        //end edit mode if we entered it
        if(!saveComplete) {
            this.startEditMode();
        }
    }

    cancel() {
        //reset the original data
        var cancelComplete = this.displayContainer.onCancel();

        if(cancelComplete) {
            this.endEditMode();
        }
    }
    
    //=============================
    // Implemement in extending class
    //=============================
    
    //This method gets the data from the editor. REQUIRED
    //getData() {}
    
    //this sets the data into the editor display. REQUIRED if edit mode or save is used
    //setData(data) {}
    
    //this methodis called on loading the display. OPTIONAL
    //onLoad() {}
    
    //this methodis called on loading the display. OPTIONAL
    //onUnLoad() {}

    //this methodis called on loading the display. OPTIONAL
    //onResize() { }

    //this methodis called on loading the display. OPTIONAL
    //destroy() {}
    
    //This method returns the content element for the data display REQUIRED
    //getContent() {}
    
    //This method returns the content type for the content. The choices of values are REQUIRED
    //apogeeui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
    //apogeeui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.*/
    //getContentType() {}

    //----------------------------
    // This is the View resize API
    // The display has controls for the user to resize the display. These use the 
    // following API to interact with the display
    //----------------------------

    /** This method returns one of the following values to indicate support for resizing.
     * - DataDisplay.RESIZE_NO_SUPPORT - The UI should not resize the display
     * - DataDisplay.RESIZE_NO_INTERNAL_SUPPORT - The view shows a fixed size display. The UI is free to show a portion of it.
     * - DataDisplay.RESIZE_INTERNAL_SUPPORT - The view supports the API to resize itself internally.
     */
    getResizeSupport() {
        return DataDisplay.RESIZE_NO_SUPPORT;
    }

    /** This method gets the resize mode. Options:
     * - DataDisplay.RESIZE_MODE_SOME;
     * - DataDisplay.RESIZE_MODE_MAX;
     */
    //getResizeMode();

    /** This method sets the resize mode. Options:
     * - DataDisplay.RESIZE_MODE_SOME;
     * - DataDisplay.RESIZE_MODE_MAX;
     */
    //setResizeMode(resizeMode);

    /** This method adjusts the size when the resize mode is DataDisplay.RESIZE_MODE_SOME. Options:
     * - DataDisplay.RESIZE_MORE;
     * - DataDisplay.RESIZE_LESS;
    */
    //adjustSize(adjustment);

    /** This method returns the possible resize options, for use in the mode DataDisplay.RESIZE_MODE_SOME. Flags:
     * - DataDisplay.RESIZE_LESS = 1;
     * - DataDisplay.RESIZE_MORE = 2;
     * - DataDisplay.RESIZE_NONE = 0;
     * These flags should be or'ed togethder to give the allowed options.
    */
    //getSizeAdjustFlags();

    //=============================
    // protected, package and private Methods
    //=============================
	
    showData() {
        var data;
        var editOk;
        if(this.callbacks) {
            if(this.callbacks.getData) {
                data = this.callbacks.getData();
            }
            if(this.callbacks.getEditOk) {
                editOk = this.callbacks.getEditOk();
            }
        }
        if(data === undefined) {
            data = "DATA UNAVAILABLE";
            this.editOK = false;
        }
        else if(editOk === undefined) {
            this.editOk = false;
        }
        else {
            this.editOk = editOk;
        }
        
        this.setData(data);
    }

    /** @protected */
    endEditMode() {
        this.displayContainer.endEditMode();

    }
    
    /** @protected */
    startEditMode() {
        var onSave = () => this.save();
        var onCancel = () => this.cancel();

        this.displayContainer.startEditMode(onSave,onCancel);
    }

    /** @protected */
    onTriggerEditMode() {
        if(this.editOk) {
            this.startEditMode();
        }
    }
}

DataDisplay.RESIZE_NO_SUPPORT = "resize_none";
DataDisplay.RESIZE_NO_INTERNAL_SUPPORT = "resize_external";
DataDisplay.RESIZE_INTERNAL_SUPPORT = "resize_internal";

DataDisplay.RESIZE_MODE_SOME = "resize_mode_some";
DataDisplay.RESIZE_MODE_MAX = "resize_mode_max";

DataDisplay.RESIZE_LESS = 1;
DataDisplay.RESIZE_MORE = 2;
DataDisplay.RESIZE_NONE = 0;