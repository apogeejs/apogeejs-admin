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
    this.containerElement = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
    this.outputElement = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    this.containerElement.appendChild(this.outputElement);
    
    //content
    if(html) {
        this.outputElement.innerHTML = html;
    }
    
    //add resize/load listener if needed
    var addResizeListener = false;
    var resizeCallback;
    var loadCallback;
    var instance = this;
    
    if(resource.onLoad) {
        loadCallback = function() {
            try {
                resource.onLoad.call(resource,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + this.outputMode.getFullName() + " onLoad function: " + error.message);
            }
            //set data now that element is loaded
            instance.outputMode.showData();
        };
        addResizeListener = true;
    }
    if(resource.onResize) {
        resizeCallback = function() {
            try {
                resource.onResize.call(resource,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                console.log("Error in " + this.outputMode.getFullName() + " onResize function: " + error.message);
            }
        };
        addResizeListener = true;
    }
    if(addResizeListener) {
        haxapp.ui.setResizeListener(this.containerElement, resizeCallback, loadCallback);
    }
    
    //initialization
    
    
    if(resource.init) {
        try {
            resource.init.call(resource,this.outputElement,outputMode);
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " init function: " + error.message);
        }
    }
}

haxapp.app.CustomControlDataDisplay.prototype.getElement = function() {
    return this.containerElement;
}

haxapp.app.CustomControlDataDisplay.prototype.showData = function(data) {
    if(this.resource.setData) {
        try {
            this.resource.setData.call(this.resource,data,this.outputElement,this.outputMode);
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " setData function: " + error.message);
        }
    }
}

haxapp.app.CustomControlDataDisplay.prototype.hide = function() {
    if(this.resource.onHide) {
        try {
            this.resource.onHide.call(this.resource,this.outputElement,this.outputMode);
            
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " onHide function: " + error.message);
        }
    }
}

haxapp.app.CustomControlDataDisplay.prototype.destroy = function() {
    if(this.resource.destroy) {
        try {
            this.resource.destroy.call(this.resource,this.outputElement,this.outputMode);
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " destroy function: " + error.message);
        }
    }
}




