import DataDisplay from "/apogeeapp/app/datadisplay/DataDisplay.js";
import ConfigurablePanel from "/apogeeapp/ui/configurablepanel/ConfigurablePanel.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";

/* This is a form display. It is meant for taking a submit action. If you want a form
 * tied to a data value, the ConfigurableFormEditor can be used.
 * 
 * @param {type} displayContainer - the display container
 * @param {type} getLayout - this callback retrieves the form layout
 */
export default class ConfigurableFormDisplay extends DataDisplay {
    
    constructor(displayContainer,callbacks,getLayoutInfo) {
        super(displayContainer,callbacks);  
        
        this.panel = this.panel = new ConfigurablePanel();
    }
    
    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    
    //this sets the data into the editor display. REQUIRED
    setData(layoutData) {
        this.panel.configureForm(layoutData);
    }
}
