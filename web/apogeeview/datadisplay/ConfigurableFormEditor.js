import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import ConfigurablePanel from "/apogeeui/configurablepanel/ConfigurablePanel.js";
import apogeeui from "/apogeeui/apogeeui.js";

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
    }

    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    /** This returns the form value (not the layout too) */
    getData() {
        //output data is the form
        return this.panel.getValue();
    }
    
    /** This is passed the data form the data callback, which should be the extended data  - including layout + value */
    setData(savedFormValue) {
        //input data is the layout and the value
        this.panel.setValue(savedFormValue);
        
        //set change to enable save bar is form value differs from initial data
        let dataSource = this.getDataSource();
        if((dataSource.getEditOk)&&(dataSource.getEditOk())) {
            var onChange = (currentFormValue,form) => {
                if(apogeeutil.jsonEquals(currentFormValue,savedFormValue)) {
                    this.endEditMode()
                }
                else {
                    this.startEditMode();
                }
            }
            this.panel.addOnChange(onChange);
        }     
    }
}

