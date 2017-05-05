
haxapp.app.ResourceOutputMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,false);
	
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

haxapp.app.AceTextMode.prototype.createEditor = function() {
    throw new Error("Implement control resource output mode");
}

haxapp.app.ResourceOutputMode.prototype.getElement = function() {
	return this.outputElement;
}
	
haxapp.app.ResourceOutputMode.prototype.showData = function() {
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

