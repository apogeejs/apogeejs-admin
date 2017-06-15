
haxapp.app.ResourceOutputMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);
	
	this.outputElement = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    
    //no editor - override methods below as needed
}

haxapp.app.ResourceOutputMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.ResourceOutputMode.prototype.constructor = haxapp.app.ResourceOutputMode;

haxapp.app.ResourceOutputMode.prototype.createDisplay = function() {
    //ADD THIS!!!
    return null;
}

haxapp.app.ResourceOutputMode.prototype.getDisplayData = function() {
	return this.member.getData();	
}

haxapp.app.ResourceOutputMode.prototype.getIsDataEditable = function() {
    return false;
}

//TEMP!!!
haxapp.app.ResourceOutputMode.prototype.dataShown = function() {
	
    var resource = this.member.getResource();
    if((resource)&&(resource.shown)) {
        resource.shown();
    }   
}

/** Override this to properly update the control. */
haxapp.app.ViewMode.prototype.memberUpdated = function() {
    this.showData();
}

haxapp.app.ResourceOutputMode.prototype.destroy = function() {
    var resource = this.member.getResource();
    if((resource)&&(resource.hide)) {
        resource.hide();
    }
}

