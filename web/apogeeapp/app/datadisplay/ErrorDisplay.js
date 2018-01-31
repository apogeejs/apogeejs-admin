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
apogeeapp.app.ErrorDisplay = class extends apogeeapp.app.NonEditorDataDisplay {
    constructor(viewMode) {
        super(viewMode);
    
        var containerDiv = this.getElement();
        
        var msg = "ERROR - Component not loaded!";
        var msgDiv = apogeeapp.ui.createElement("div");
        msgDiv.style = "color:red; font-weight:bold";
        msgDiv.innerHTML = msg;
        containerDiv.appendChild(msgDiv);
    }

    showData() {
        //no action
    }
}
