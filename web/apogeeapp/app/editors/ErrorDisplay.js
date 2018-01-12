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
apogeeapp.app.ErrorDisplay = function(outputMode) {
    this.outputMode = outputMode;
    this.outputElement = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    
    var msg = "ERROR - Component not loaded!";
    var msgDiv = apogeeapp.ui.createElement("div");
    msgDiv.style = "color:red; font-weight:bold";
    msgDiv.innerHTML = msg;
    this.outputElement.appendChild(msgDiv);
}

apogeeapp.app.ErrorDisplay.prototype.getElement = function() {
    return this.outputElement;
}

apogeeapp.app.ErrorDisplay.prototype.getOutputMode = function() {
    return this.outputMode;
}

apogeeapp.app.ErrorDisplay.prototype.showData = function(text,editOk) {
    //no action
}
