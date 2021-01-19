import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import {ConfigurablePanel} from "/apogeeui/apogeeUiLib.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";

/** This is an editor that displays a customized form for data input. */
export default class ConfigurableFormEditor extends DataDisplay {
    
    /** This allows for a static or dynamic layout setting
     * @param {type} displayContainer - the displayContainer
     * @param {type} dataSource - {
     *  - doUpdate - this should return reloadDataDisplay = true if the form should be reconfigured. 
     *          otherwise it should return reloadData if the form data should be reloaded.
     *  - getData - returns the desired form value,
     *  - getEditOk - gets if form is editable (optional)
     *  - setData - called when data is saved, with the form value (optional)
     *  - getDisplayData - This returns the layout for the configurable form.
     *  }
     */
    constructor(displayContainer,dataSource) {
        super(displayContainer,dataSource);

        //TEMP - to raise the z index
        let domElement = this.displayContainer.getDisplayElement();
        if(domElement) {
            domElement.style.zIndex = 2;
        }
        
        //construct the display
        this.panel = new ConfigurablePanel();

        //get data and handle invalid display
        if(this.dataSource.getDisplayData) {
            let dataResult = DATA_DISPLAY_CONSTANTS.readWrappedDisplayData(this.dataSource.getDisplayData,"Error loading form layout: ");
            if(dataResult.displayInvalid) {
                //display invalid! hide display and show message
                this.displayContainer.setHideDisplay(dataResult.hideDisplay);
                this.displayContainer.setMessage(dataResult.messageType,dataResult.message);
                this.setDisplayValid(false);
            }
            else {
                //display display valid
                this.panel.configureForm(dataResult.data);
                this.panel.addOnInput( formValue => this.onFormInput(formValue));
                this.setDisplayValid(true);
            }
        }
    }

    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    /** This returns the form value (not the layout too) */
    getData() {
        if(!this.panel) {
            //why is this happening? DEBUG!!!
            console.log("Doh!")
            return this.changeReferenceValue;
        }
        //get the form value, and set it to the refernece for changes to the form 
        this.changeReferenceValue = this.panel.getValue();
        return this.changeReferenceValue;
    }

    /** This returns the form meta value. */
    getFormMeta() {
        return this.panel.getMeta();
    }
    
    /** This is passed the data form the data callback, which should be the extended data  - including layout + value */
    setData(data) {
        //we need a better error case
        if(data == apogeeutil.INVALID_VALUE) {
            data = {};
        }

        this.changeReferenceFormValue = data;

        //input data is the layout and the value
        this.panel.setValue(data);
    }

    onFormInput(formValue) {
        //set change to enable save bar if form value differs from initial data
        let dataSource = this.getDataSource();
        let editOk = (dataSource.getEditOk)&&(dataSource.getEditOk()); 
        if(editOk) {
            if(!apogeeutil.jsonEquals(formValue,this.changeReferenceFormValue)) {
                
                this.startEditMode();
            }
            else {
                //I think I like it better without clearing the edit state if we revert to the original value
                //this.endEditMode()
            }
        }
    }

    /** This does some cleanup */
    destroy() {
        this.panel.destroy();
        this.panel = null;
    }

    //===========================
    // Utilities for forms
    //===========================

    static getErrorLayout(errorMsg) {
        return ConfigurablePanel.getErrorMessageLayoutInfo(errorMsg);
    }

    static getEmptyLayout() {
        return ConfigurablePanel.EMPTY_LAYOUT;
    }
}

