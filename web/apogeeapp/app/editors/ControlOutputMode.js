
apogeeapp.app.ControlOutputMode = function(componentDisplay,doKeepAlive) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,doKeepAlive);   
        
    this.component = componentDisplay.getComponent();
    this.member = this.component.getObject();
    
    //no editor - override methods below as needed
}

apogeeapp.app.ControlOutputMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.ControlOutputMode.prototype.constructor = apogeeapp.app.ControlOutputMode;

apogeeapp.app.ControlOutputMode.prototype.createDisplay = function() {
    return this.component.getDataDisplay(this);
}

apogeeapp.app.ControlOutputMode.prototype.getDisplayData = function() {
	return this.member.getData();
}

apogeeapp.app.ControlOutputMode.prototype.getFullName = function() {
	return this.member.getFullName();
}

//this is not applicable, for now at least
apogeeapp.app.ControlOutputMode.prototype.getIsDataEditable = function() {
    return false;
}