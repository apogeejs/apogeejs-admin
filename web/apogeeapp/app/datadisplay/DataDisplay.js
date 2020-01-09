import DATA_DISPLAY_CONSTANTS from "/apogeeapp/app/datadisplay/dataDisplayConstants.js"

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

        //defaults for container sizing logic
        this.supressContainerHorizontalScroll = false;
        this.useContainerHeightUi = false;
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
    
    //this method is called on loading the display. OPTIONAL
    //onLoad() {}
    
    //this method is called on unloading the display. OPTIONAL
    //onUnLoad() {}

    //this method is called when the display will be destroyed. OPTIONAL
    //destroy() {}
    
    //This method returns the content element for the data display REQUIRED
    //getContent() {}

    //----------------------------
    // This is the View resize API
    // The display has controls for the user to resize the display. These use the 
    // following API to interact with the display
    //----------------------------

    /** This function is called to see if the container should provide horizontal scroll bars for the display view content. */
    getSupressContainerHorizontalScroll() {
        return this.supressContainerHorizontalScroll;
    }

    /** This sets the variable that determines if the container will provide a horizontal scroll bars for the display view
     * content. The default value is false. */
    setSupressContainerHorizontalScroll(supressContainerHorizontalScroll) {
        this.supressContainerHorizontalScroll = supressContainerHorizontalScroll;
    }

    /** This function is called to see if the container should provide a view height UI, if the container supports it. */
    getUseContainerHeightUi() {
        return this.useContainerHeightUi;
    }

    /** This sets the variable that determines if the container will provide a height adjustment UI. The default value is false. */
    setUseContainerHeightUi(useContainerHeightUi) {
        this.useContainerHeightUi = useContainerHeightUi;
    }

    /** This method gets the resize mode. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
     */
    //getResizeHeightMode();

    /** This method sets the resize mode. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
     */
    //setResizeHeightMode(resizeMode);

    /** This method adjusts the size when the resize mode is DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS;
    */
    //adjustHeight(adjustment);

    /** This method returns the possible resize options, for use in the mode DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME. Flags:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS = 1;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE = 2;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_NONE = 0;
     * These flags should be or'ed togethder to give the allowed options.
    */
    //getHeightAdjustFlags();

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