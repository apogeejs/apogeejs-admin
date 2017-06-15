
haxapp.app.NewResourceOutputMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);   
        
    this.component = componentDisplay.getComponent();
    this.member = this.component.getObject();
    
    //no editor - override methods below as needed
}

haxapp.app.NewResourceOutputMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.NewResourceOutputMode.prototype.constructor = haxapp.app.NewResourceOutputMode;

haxapp.app.NewResourceOutputMode.prototype.createDisplay = function() {
    var resource = this.component.createResource();
    var dataDisplay = new haxapp.app.CustomControlDataDisplay(resource,this);
    return dataDisplay
}

haxapp.app.NewResourceOutputMode.prototype.getDisplayData = function() {
	return this.member.getData();
}

haxapp.app.NewResourceOutputMode.prototype.getFullName = function() {
	return this.member.getFullName();
}

//this is not applicable, for now at least
haxapp.app.NewResourceOutputMode.prototype.getIsDataEditable = function() {
    return false;
}

//TEMP!!!
//haxapp.app.NewResourceOutputMode.prototype.dataShown = function() {	
//    var resource = this.component.getResource();
//    if((resource)&&(resource.shown)) {
//        resource.shown(this.member.getData(),this.outputElement);
//    }   
//}

//================================
// Custom Control Data Display(/Editor)
//================================

/** Methods to implement in the resource:
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * onShown(data,outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */

/** This is the display/editor for the custom control output. */
haxapp.app.CustomControlDataDisplay = function(resource,outputMode) {
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

haxapp.app.CustomControlDataDisplay.prototype.onShown = function() {
    if(this.resource.onShown) {
        try {
            this.resource.onShown(this.outputMode.getDisplayData(),this.outputElement,this.outputMode);
        }
        catch(error) {
            "Error in " + this.outputMode.getFullName() + " onShown function: " + error.message;
        }
    }
}

haxapp.app.CustomControlDataDisplay.prototype.onHide = function() {
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


