
haxapp.app.ResourceOutputMode = function(componentDisplay) {
	this.componentDisplay = componentDisplay;
	
	this.outputElement = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
}

/** This indicates if this element displays data or something else (code) */
haxapp.app.ResourceOutputMode.prototype.isData = true;

haxapp.app.ResourceOutputMode.prototype.getElement = function() {
	return this.outputElement;
}
	
haxapp.app.ResourceOutputMode.prototype.showData = function(editOk) {
	//edit ok ignored - no edit of the control data object - there is none
	
	var control = this.componentDisplay.getObject();
    var resource = control.getResource();
    if((resource)&&(resource.show)) {
        resource.show();
    }   
}

haxapp.app.ResourceOutputMode.prototype.destroy = function() {
    var control = this.componentDisplay.getObject();
    var resource = control.getResource();
    if((resource)&&(resource.hide)) {
        resource.hide();
    }
}

//==============================
// internal
//==============================

haxapp.app.ResourceOutputMode.prototype.onSave = function(data) {
	//no saving action
}

