
haxapp.app.ControlOutputMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);   
        
    this.component = componentDisplay.getComponent();
    this.member = this.component.getObject();
    
    //no editor - override methods below as needed
}

haxapp.app.ControlOutputMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.ControlOutputMode.prototype.constructor = haxapp.app.ControlOutputMode;

haxapp.app.ControlOutputMode.prototype.createDisplay = function() {
    return this.component.getDataDisplay(this);
}

haxapp.app.ControlOutputMode.prototype.getDisplayData = function() {
	return this.member.getData();
}

haxapp.app.ControlOutputMode.prototype.getFullName = function() {
	return this.member.getFullName();
}

//this is not applicable, for now at least
haxapp.app.ControlOutputMode.prototype.getIsDataEditable = function() {
    return false;
}