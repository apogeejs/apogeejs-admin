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
        this.editMode = false;
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }

    save() {
        var text = this.getEditorData();
        var saveComplete;

        if((this.callbacks)&&(this.callbacks.saveData)) {
            saveComplete = this.callbacks.saveData(text);
        }
        else {
            alert("Error: Data not saved: ave callback not set!");
            saveComplete = true;
        }

        //end edit mode if we entered it
        if((saveComplete)&&(this.editMode)) {
            this.endEditMode();
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


    //=============================
    // protected, package and private Methods
    //=============================

    getElement() {
        return this.outsideDiv;
    }
	
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
        this.editMode = false;
        this.viewMode.endEditMode();
    }
    
    /** @protected */
    startEditMode() {
        var onSave = () => this.save();
        var onCancel = () => this.cancel();

        this.viewMode.startEditMode(onSave,onCancel);

        this.editMode = true;
    }

    /** @protected */
    onTriggerEditMode() {
        if((this.editOk)&&(!this.editMode)) {
            this.startEditMode();
        }
    }
}

apogeeapp.app.EditorDataDisplay.NON_SCROLLING = "apogee_datadisplay_container_fixed";
apogeeapp.app.EditorDataDisplay.SCROLLING = "apogee_datadisplay_container_scrolling";
