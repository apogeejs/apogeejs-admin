/** JsDataDisplay
 * This is the data display for a custom control where the control is generated
 * from javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestHide(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */

/** This is the display/editor for the custom control output. */
haxapp.app.JsDataDisplay = function(outputMode) {
    this.outputMode = outputMode;
    this.outputElement = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
}

haxapp.app.JsDataDisplay.prototype.getElement = function() {
    return this.outputElement;
}

haxapp.app.JsDataDisplay.prototype.getOutputMode = function() {
    return this.outputMode;
}

//-------------------------
//Implementation Methods (all optional)
//-------------------------
   
/** This method is called to set data for the data display. */
//haxapp.app.JsDataDisplay.prototype.showData = function(data)

/** This method is called before the data display is hidden. 
 * Possible return values:
 * haxapp.app.ViewMode.UNSAVED_DATA: do not hide the data display. Show an unsaved data message.
 * haxapp.app.ViewMode.CLOSE_OK: ok to hide the data display
 */
//haxapp.app.JsDataDisplay.prototype.hideRequest = function()

/** This method is called after the data display is hidden. */
//haxapp.app.JsDataDisplay.prototype.onHide = function()

/** This method is called when the data display is being destroyed. */
//haxapp.app.JsDataDisplay.prototype.destroy = function()
    
