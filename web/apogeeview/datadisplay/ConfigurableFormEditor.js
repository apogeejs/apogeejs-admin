import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import {ConfigurablePanel} from "/apogeeui/apogeeUiLib.js";

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
     *  - getLayout - This returns the layour for the configurable form.
     *  }
     */
    constructor(displayContainer,dataSource) {
        super(displayContainer,dataSource);
        
        //construct the display
        this.panel = new ConfigurablePanel();
        if(dataSource.getDisplayData) {
            this.panel.configureForm(dataSource.getDisplayData());
        }

        this.panel.addOnChange( formValue => this.onFormChange(formValue));
    }

    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    /** This returns the form value (not the layout too) */
    getData() {
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

    onFormChange(formValue) {
        //set change to enable save bar is form value differs from initial data
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

