/** HtmlJsDataDisplay
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * constructorAddition(outputMode);
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 * onLoad(outputElement,outputMode);
 * onResize(outputElement,outputMode);
 */

/** This is the display/editor for the custom control output. */
apogeeapp.app.HtmlJsDataDisplay = function(html,resource,outputMode) {
    this.resource = resource;
    this.outputMode = outputMode;
    this.containerElement = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
    this.outputElement = apogeeapp.ui.createElement("div",null,{
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
    
    //-------------------
    //constructor code
    //-------------------
    
    if(resource.constructorAddition) {
        try {
            //custom code
            resource.constructorAddition.call(this,outputMode);
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " init function: " + error.message);
        }
    }
    
    //------------------------
    //add resize/load listener if needed
    //------------------------
    
    var addLoadListener = false;
    var addResizeListener = false;
    var resizeCallback;
    var loadCallback;
    var instance = this;
    
    if(resource.onLoad) {
        loadCallback = function() {
            try {
                resource.onLoad.call(instance,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " onLoad function: " + error.message);
            }
            //set data now that element is loaded
            instance.outputMode.showData();
        };
        addLoadListener = true;
    }
    
    if(addLoadListener) {
        apogeeapp.ui.setLoadListener(this.containerElement, loadCallback);
    }
    
    if(resource.onResize) {
        resizeCallback = function() {
            try {
                resource.onResize.call(instance,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                console.log("Error in " + instance.outputMode.getFullName() + " onResize function: " + error.message);
            }
        };
        addResizeListener = true;
    }
    
    //-------------------------
    //add the (other) optional methods to this class
    //-------------------------
    
    if((this.resource.setData)||(addResizeListener)) {
        this.showData = function(data) {
            try {
                if(this.resource.setData) {
                    resource.setData.call(instance,data,instance.outputElement,instance.outputMode);
                }
            
                if((addResizeListener)&&(!instance.callbackAttached)) {
                    var displayWindow = instance.outputMode.getDisplayWindow();
                    if(displayWindow) {
                        displayWindow.addListener(apogeeapp.ui.RESIZED_EVENT,resizeCallback);
                        instance.callbackAttached = true;
                    }
                }
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " setData function: " + error.message);
            }
        }
    }
    else {
        //we must include a function here
        this.showData = function(data){};
    }
    
    if(this.resource.hideRequest) {     
        this.hideRequest = function() {
            try {
                resource.onHide.call(instance,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " onHide function: " + error.message);
            }
        }
    }

    if((this.resource.onHide)||(instance.callbackAttached)) {   
        this.hide = function() {
            try {
                if(instance.resource.onHide) {
                    resource.onHide.call(instance,instance.outputElement,instance.outputMode);
                }
                
                if(instance.callbackAttached) {
                    var displayWindow = instance.outputMode.getDisplayWindow();
                    if(displayWindow) {
                        displayWindow.removeListener(apogeeapp.ui.RESIZED_EVENT,instance.resizeCallback);
                        instance.callbackAttached = false;
                    }
                }
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " onHide function: " + error.message);
            }
        }
    }

    if(this.resource.destroy) {
        this.destroy = function() {
            try {
                resource.destroy.call(instance,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " destroy function: " + error.message);
            }
        }
    }
    
    //-------------------
    //initialization
    //-------------------
    
    if(resource.init) {
        try {
            resource.init.call(this,this.outputElement,outputMode);
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " init function: " + error.message);
        }
    }
}

apogeeapp.app.HtmlJsDataDisplay.prototype.getElement = function() {
    return this.containerElement;
}




