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
apogeeapp.app.JsDataDisplay = function(outputMode) {
    this.outputMode = outputMode;
    this.outputElement = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
}

apogeeapp.app.JsDataDisplay.prototype.getElement = function() {
    return this.outputElement;
}

apogeeapp.app.JsDataDisplay.prototype.getOutputMode = function() {
    return this.outputMode;
}

//-------------------------
//Implementation Methods (all optional)
//-------------------------
   
/** This method is called to set data for the data display. */
//apogeeapp.app.JsDataDisplay.prototype.showData = function(data)

/** This method is called before the data display is hidden. 
 * Possible return values:
 * apogeeapp.app.ViewMode.UNSAVED_DATA: do not hide the data display. Show an unsaved data message.
 * apogeeapp.app.ViewMode.CLOSE_OK: ok to hide the data display
 */
//apogeeapp.app.JsDataDisplay.prototype.isCloseOk = function()

/** This method is called when the element is added to the DOM. */
//apogeeapp.app.JsDataDisplay.prototype.onLoad = function()

/** This method is called when the element is removed from the DOM. */
//apogeeapp.app.JsDataDisplay.prototype.onUnload = function()

/** This method is called when the display is resized. */
//apogeeapp.app.JsDataDisplay.prototype.onResize = function()

/** This method is called when the data display is being destroyed. */
//apogeeapp.app.JsDataDisplay.prototype.destroy = function()


    
