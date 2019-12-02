import util from "/apogeeutil/util.js";

import DataDisplay from "/apogeeapp/app/datadisplay/DataDisplay.js";
import ConfigurablePanel from "/apogeeapp/ui/configurablepanel/ConfigurablePanel.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";

/** This is an editor that displays a customized form for data input. */
export default class ConfigurableFormEditor extends DataDisplay {
    
    /** This allows for a static or dynamic layout setting
     * @param {type} displayContainer - the displayContainer
     * @param {type} callbacks - {
     *  - getData - returns the desired form value,
     *  - getEditOk - gets if form is editable,
     *  - setData - called when data is saved, with the form value
     *  - getLayoutInfo - OPTIONAL - if this is set, the layout will be dynamically loaded whenever the
     *  form is updated. Alternatively, the fixed layout info can be passed in as a constructor argument.
     *  }
     * @param {type} optionalFixedLayoutInfo - the layout for the configurable panel. 
     * It should be populated if a fixed layout is OK. In this case, the getLayoutInfo
     * allack should not be populated. 
     */
    constructor(displayContainer,callbacks,optionalFixedLayoutInfo) {
        super(displayContainer,callbacks,DataDisplay.SCROLLING);
        
        //layout can be fixed or dynamic
        this.dynamicLayoutCallback = callbacks.getLayoutInfo;
        
        this.panel = new ConfigurablePanel();
        
        if(optionalFixedLayoutInfo) {
            this.panel.configureForm(optionalFixedLayoutInfo);
        }
    }

    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    getContentType() {
        return apogeeui.FIXED_SIZE;
    }
    
    /** This returns the form value (not the layout too) */
    getData() {
        //output data is the form
        return this.panel.getValue();
    }
    
    /** This is passed the data form the data callback, which should be the extended data  - including layout + value */
    setData(savedFormValue) {
        //input data is the layout and the value

        //set layout if dynmaically loaded
        if(this.dynamicLayoutCallback) {
            var layoutInfo = this.dynamicLayoutCallback();
            this.panel.configureForm(layoutInfo);
        }
        this.panel.setValue(savedFormValue);
        
        //set change to enable save bar is form value differs from initial data
        var onChange = (currentFormValue,form) => {
            if(util.jsonEquals(currentFormValue,savedFormValue)) {
                this.endEditMode()
            }
            else {
                this.startEditMode();
            }
        }
        this.panel.addOnChange(onChange);     
    }
}

