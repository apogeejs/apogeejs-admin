/** HtmlJsDataDisplay
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * constructorAddition(outputMode);
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * isCloseOk(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 * onLoad(outputElement,outputMode);
 * onUnload(outputElement,outputMode);
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
    
    var instance = this;
    
    if(this.resource.onLoad) {
        this.onLoad = function() {
            try {
                resource.onLoad.call(instance,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " onLoad function: " + error.message);
            }
        };
    }
    
    if(this.resource.onUnload) {   
        this.onUnload = function() {
            try {
                if(instance.resource.onHide) {
                    resource.onUnload.call(instance,instance.outputElement,instance.outputMode);
                }
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " onUnload function: " + error.message);
            }
        }
    }
    
    if(this.resource.onResize) {
        this.onResize = function() {
            try {
                resource.onResize.call(instance,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                console.log("Error in " + instance.outputMode.getFullName() + " onResize function: " + error.message);
            }
        };
    }
    
    if(this.resource.setData) {
        this.showData = function(data) {
            try {
                if(this.resource.setData) {
                    resource.setData.call(instance,data,instance.outputElement,instance.outputMode);
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
    
    if(this.resource.isCloseOk) {     
        this.isCloseOk = function() {
            try {
                resource.isCloseOk.call(instance,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " isCloseOk function: " + error.message);
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




