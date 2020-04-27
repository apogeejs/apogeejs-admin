import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import {apogeeui} from "/apogeeui/apogeeUiLib.js";

/** JsDataDisplay
 * This is the data display for a custom control where the control is generated
 * from javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestInactive(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */

/** This is the display/editor for the custom control output. */
export default class ErrorDisplay extends DataDisplay {
    constructor(displayContainer) {
        var dataSource = {
            doUpdate: () => false,
            getData: () => null
        }
        super(displayContainer,dataSource);
        
        var msg = "ERROR - Component not loaded!";
        var msgDiv = apogeeui.createElement("div");
        msgDiv.style = "color:red; font-weight:bold";
        msgDiv.innerHTML = msg;
        
        this.displayElement = msgDiv;
    }
    
    /** This method will return undefined until showData is called. */
    getContent() {
        return this.displayElement;
    }

    setData(data) {
        //no action
    }
}
