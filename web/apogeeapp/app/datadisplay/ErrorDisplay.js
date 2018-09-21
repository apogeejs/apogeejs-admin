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
apogeeapp.app.ErrorDisplay = class extends apogeeapp.app.DataDisplay {
    constructor(viewMode) {
        var callbacks = {
            getData: () => null
        }
        super(viewMode,callbacks);
        
        var msg = "ERROR - Component not loaded!";
        var msgDiv = apogeeapp.ui.createElement("div");
        msgDiv.style = "color:red; font-weight:bold";
        msgDiv.innerHTML = msg;
        
        this.displayElement = msgDiv;
    }
    
    /** This method will return undefined until showData is called. */
    getContent() {
        return this.displayElement;
    }
    
    getContentType() {
        return apogeeapp.ui.FIXED_SIZE;
    }

    setData(data) {
        //no action
    }
}
