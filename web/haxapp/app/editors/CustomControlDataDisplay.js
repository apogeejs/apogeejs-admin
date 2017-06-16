/** CustomControlDataDisplay
 * This is the data display for a custom control. Is should be passed a 
 * resource which has the following methods optionally defined: 
 * 
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * onShown(data,outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */

/** This is the display/editor for the custom control output. */
haxapp.app.CustomControlDataDisplay = function(html,resource,outputMode) {
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
    
    if(html) {
        this.outputElement.innerHTML = html;
    }
    
    if(resource.init) {
        resource.init(this.outputElement,outputMode);
    }
}

haxapp.app.CustomControlDataDisplay.prototype.getElement = function() {
    return this.outputElement;
}

haxapp.app.CustomControlDataDisplay.prototype.showData = function(data) {
    if(this.resource.setData) {
        try {
            this.resource.setData(data,this.outputElement,this.outputMode);
        }
        catch(error) {
            "Error in " + this.outputMode.getFullName() + " setData function: " + error.message;
        }
    }
}

haxapp.app.CustomControlDataDisplay.prototype.dataShown = function() {
    if(this.resource.onShown) {
        try {
            this.resource.onShown(this.outputElement,this.outputMode);
        }
        catch(error) {
            "Error in " + this.outputMode.getFullName() + " onShown function: " + error.message;
        }
    }
}

haxapp.app.CustomControlDataDisplay.prototype.hide = function() {
    if(this.resource.onHide) {
        try {
            this.resource.onHide(this.outputElement,this.outputMode);
        }
        catch(error) {
            "Error in " + this.outputMode.getFullName() + " onHide function: " + error.message;
        }
    }
}

haxapp.app.CustomControlDataDisplay.prototype.destroy = function() {
    if(this.resource.destroy) {
        try {
            this.resource.destroy(this.outputElement,this.outputMode);
        }
        catch(error) {
            "Error in " + this.outputMode.getFullName() + " destroy function: " + error.message;
        }
    }
}




