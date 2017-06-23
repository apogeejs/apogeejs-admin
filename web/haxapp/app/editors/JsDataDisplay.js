/** JsDataDisplay
 * This is the data display for a custom control where the control is generated
 * from javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */

/** This is the display/editor for the custom control output. */
haxapp.app.JsDataDisplay = function(resource,outputMode) {
    this.resource = resource;
    this.outputMode = outputMode;
    this.outputElement = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    
    //-------------------------
    //add the optional methods to this class
    //-------------------------
    
    if(this.resource.setData) {
        this.showData = function(data) {
            try {
                this.resource.setData.call(this.resource,data,this.outputElement,this.outputMode);
            }
            catch(error) {
                alert("Error in " + this.outputMode.getFullName() + " setData function: " + error.message);
            }
        }
    }
    
    if(this.resource.hideRequest) {     
        this.hideRequest = function() {
            try {
                this.resource.onHide.call(this.resource,this.outputElement,this.outputMode);

            }
            catch(error) {
                alert("Error in " + this.outputMode.getFullName() + " onHide function: " + error.message);
            }
        }
    }

    if(this.resource.onHide) {   
        this.hide = function() {
            try {
                this.resource.onHide.call(this.resource,this.outputElement,this.outputMode);

            }
            catch(error) {
                alert("Error in " + this.outputMode.getFullName() + " onHide function: " + error.message);
            }
        }
    }

    if(this.resource.destroy) {
        this.destroy = function() {
            try {
                this.resource.destroy.call(this.resource,this.outputElement,this.outputMode);
            }
            catch(error) {
                alert("Error in " + this.outputMode.getFullName() + " destroy function: " + error.message);
            }
        }
    }
    
    //-------------------
    //initialization
    //-------------------
    
    if(resource.init) {
        try {
            resource.init.call(resource,this.outputElement,outputMode);
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " init function: " + error.message);
        }
    }
}

haxapp.app.JsDataDisplay.prototype.getElement = function() {
    return this.outputElement;
}




