import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";

/** This is the base class for data displays, which show individual edit/display fields for a component. For example, a standard JSON
 * data component has three data displays, for the component value, the function body and the supplemental code.
 * 
 * @param {type} displayContainer - this is the ui container that will show the display
 * @param {type} dataSource - the dataSource for the editor. It is an object with the following functions:
 *  - {reloadDataDisplay, reloadData} = doUpdate() - Required - This function updates the component instance
 *      held by the data source and it returns to boolean values, "reloadDataDisplay", which indicates is the data display should 
 *      be reloaded (such as if it is replaced with a new data display or if the UI elements for it have been updated) and
 *      "reloadData" which indicates the data value displayed in the data display should be reloaded.  
 *  - data = getData() - Required - This returns model data that should be displayed. The format of the data depends on the 
 *      data display. If the data is not valid, then the value apogeeutil.INVALID_VALUE should be returned.
 *  - editOk = getEditOk() - Optional - If present, this indicates if the data display edit mode should be used. If it is not present
 *      it is assumed to be false.
 *  - closeDialog = saveData(data) - Optional This is used if the data display edit mode is used. It should save the data. The return value
 *      should be true if the edit operation should be concluded. It should return false if there is a save failure such that you want to 
 *      stay in edit mode.
 *  - (other) - Optional - Data displays may define additional functions as needed for their implmentations. Examples where this is done in in the custom
 *      components to pass non-model data (like the HTML or the UI generator code) into the data display.
 */ 
export default class DataDisplay {
    constructor(displayContainer,dataSource) {
        this.displayContainer = displayContainer;
        this.dataSource = dataSource ? dataSource : {};
        this.editOk = false;
        this.displayValid = true; //default this to true, so simple displays don't need to use it

        //defaults for container sizing logic
        this.useContainerHeightUi = false;
    }

    /** This method updates the internal component instance and also returns
     * true if the data display needs to be refreshed. */
    doUpdate() {
        if(this.dataSource) {
            return this.dataSource.doUpdate();
        }
        else {
            return false;
        }
    }
    
    save() {
        var data;
        var dataValid = false;
        try {
            data = this.getData();
            dataValid = true;
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            apogeeUserAlert("Error loading data from data display: " + error.message);
        }

        //save data if we read it out
        if(dataValid) {
            var saveComplete;

            //figure out if there is a problem with this - we hav to end edit mode before
            //we save because in edit mode it will not overwrite the data in the display
            //if we fail, we restart edit mode below
            this.endEditMode();

            if(this.dataSource.saveData) {
                try {
                    saveComplete = this.dataSource.saveData(data);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    apogeeUserAlert("Error saving data: " + error.message);
                    saveComplete = false;
                }
            }
            else {
                apogeeUserAlert("Error: Data not saved: save callback not set!");
                saveComplete = false;
            }

            //end edit mode if we entered it
            if(!saveComplete) {
                this.startEditMode();
            }
        }
    }

    cancel() {
        //reset the original data
        var cancelComplete = this.displayContainer.onCancel();

        if(cancelComplete) {
            this.endEditMode();
        }
    }

    getDisplayContainer() {
        return this.displayContainer;
    }

    getDataSource() {
        return this.dataSource;
    }

    getComponentView() {
        return this.displayContainer.getComponentView();
    }
    
    //=============================
    // Implemement in extending class
    //=============================
    
    //This method gets the data from the editor. OPTIONAL. Required if editing is enabled.
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

    //---------------------------
    // UI State Management
    //---------------------------
    
    /** This method adds any data display state info to the view state json. 
     * By default there is none. Note that this modifies the json state of the view,
     * rather than providing a data object that will by added to it.. */
    addUiStateData(json) {

    }

    /** This method reads an data display state info from the view state json. */
    readUiStateData(json) {

    }

    //----------------------------
    // This is the View resize API
    // The display has controls for the user to resize the display. These use the 
    // following API to interact with the display
    //----------------------------

    /** This function is called to see if the container should provide a view height UI, if the container supports it. */
    getUseContainerHeightUi() {
        return this.useContainerHeightUi;
    }

    /** This sets the variable that determines if the container will provide a height adjustment UI. The default value is false. */
    setUseContainerHeightUi(useContainerHeightUi) {
        this.useContainerHeightUi = useContainerHeightUi;
    }

    /** This is called if the show less button is pressed, if container height UI is in use */
    //showLess();

    /** This is called if the show more button is pressed, if container height UI is in use */
    //showMore();

    /** This is called if the show max button is pressed, if container height UI is in use */
    //showMax();

    /** This method controlsthe visibility options for the resize buttons. These will only be called if 
     * resize is enabled for this data display (if container height UI is in use)
     * Flags:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_SHOW_FLAG = 1; (if not set this hides all buttons)
     * - DATA_DISPLAY_CONSTANTS.RESIZE_MODE_MAX_FLAG = 2; (if not set the mode is SOME, if set the mode is MAX)
     * - DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_LESS_FLAG = 4; (disables the less button, if it is showing)
     * - DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_MORE_FLAG = 8; (disables the more button, if it is showing)
     * - DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_MAX_FLAG = 16; (disables the max button, if it is showing)
     * These flags should be or'ed togethder to give the allowed options.
    */
    //getHeightAdjustFlags();

    //=============================
    // protected, package and private Methods
    //=============================

    /** This method should be called when the underlying display is loaded, indicating if it is 
     * valid or if it should not be used. */
    setDisplayValid(displayValid) {
        this.displayValid = displayValid;
    }
	
    showData() {
        if(!this.displayValid) return;

        //get edit ok
        if(this.dataSource.getEditOk) {
            this.editOk = this.dataSource.getEditOk()
        }
        else {
            this.editOk = false;
        }

        //get data
        let dataResult = DATA_DISPLAY_CONSTANTS.readWrappedData(this.dataSource.getData,"Error loading display data: ");

        //configure view
        this.displayContainer.setRemoveView(dataResult.removeView);
        if(!dataResult.removeView) {
            //only hide view and show message if view is not removed
            //we will set data either way to clear old date
            this.displayContainer.setHideDisplay(dataResult.hideDisplay);
            this.displayContainer.setMessage(dataResult.messageType,dataResult.message);
        }
        this.setData(dataResult.data);
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