
apogeeapp.app.ErrorMode = function(componentDisplay,displayDestroyFlags) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,displayDestroyFlags);   
        
    this.component = componentDisplay.getComponent();
    this.member = this.component.getMember();
}

apogeeapp.app.ErrorMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.ErrorMode.prototype.constructor = apogeeapp.app.ControlOutputMode;

apogeeapp.app.ErrorMode.prototype.createDisplay = function() {
    return new apogeeapp.app.ErrorDisplay(this);
}

apogeeapp.app.ErrorMode.prototype.getDisplayData = function() {
	//only dummy data!
    return "";
}

apogeeapp.app.ErrorMode.prototype.getFullName = function() {
	return this.member.getFullName();
}

/** This method returns an action messenger object for doing data updates in other tables. */ 
apogeeapp.app.ErrorMode.prototype.getMessenger = function() {
    return new apogee.action.Messenger(this.member);
}

//this is not applicable, for now at least
apogeeapp.app.ErrorMode.prototype.getIsDataEditable = function() {
    return false;
}