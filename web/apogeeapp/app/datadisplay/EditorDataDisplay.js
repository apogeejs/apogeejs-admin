/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - the callbacks for the editor {getData,getEditOk,saveData}
 * @param {type} containerClass - the is the css class for the container element OPTIONAL
 */
apogeeapp.app.EditorDataDisplay = class {
    constructor(viewMode,callbacks,containerClass = apogeeapp.app.EditorDataDisplay.NON_SCROLLING) {
        
        this.outsideDiv = apogeeapp.ui.createElementWithClass("div",containerClass);
	
        this.viewMode = viewMode;
        this.callbacks = callbacks;
        this.editOk = false;
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }
    
    save() {
        var data = this.getEditorData();
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
        var cancelComplete = this.viewMode.onCancel();

        if(cancelComplete) {
            this.endEditMode();
        }
    }
    
    //=============================
    // Implemement in extending class
    //=============================
    
    //This method gets the data from the editor. REQUIRED
    //getEditorData() {}
    
    //this sets the data into the editor display. REQUIRED if edit mode or save is used
    //setEditorData(data) {}
    
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
    //apogeeapp.ui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
    //apogeeapp.ui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.*/
    //getContentType() {}
    
    


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
        
        this.setEditorData(data);
    }

    /** @protected */
    endEditMode() {
        this.viewMode.endEditMode();

    }
    
    /** @protected */
    startEditMode() {
        var onSave = () => this.save();
        var onCancel = () => this.cancel();

        this.viewMode.startEditMode(onSave,onCancel);
    }

    /** @protected */
    onTriggerEditMode() {
        if(this.editOk) {
            this.startEditMode();
        }
    }
}

apogeeapp.app.EditorDataDisplay.NON_SCROLLING = "apogee_datadisplay_container_fixed";
apogeeapp.app.EditorDataDisplay.SCROLLING = "apogee_datadisplay_container_scrolling";

apogeeapp.app.EditorDataDisplay.FIT_CONTENT = "apogee_datadisplay_container_fit_content";
