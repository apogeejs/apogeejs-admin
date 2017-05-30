/** This is the base class for a editable component (an object with code or data),
 * It extends the component class. */
haxapp.app.EditComponent = function(workspaceUI,object,generator,options) {
    //base constructor
	haxapp.app.Component.call(this,workspaceUI,object,generator,options);
}

haxapp.app.EditComponent.prototype = Object.create(haxapp.app.Component.prototype);
haxapp.app.EditComponent.prototype.constructor = haxapp.app.EditComponent;

haxapp.app.EditComponent.prototype.createWindowDisplay = function() {
    if(this.windowDisplay == null) {
        this.windowDisplay = new haxapp.app.EditWindowComponentDisplay(this,this.windowDisplayStateJson);
    }
    else if(this.windowStateJson) {
        this.windowDisplay.setStateJson(this.windowStateJson);
    }
    return this.windowDisplay;
}

//===============================
// Protected Functions
//===============================

//Implement this in extending class
///**  This method retrieves the table edit settings for this component instance
// * @protected */
//haxapp.app.EditComponent.prototype.getTableEditSettings = function();

haxapp.app.Component.prototype.hasTabDisplay = function() {    
    return false;
}

haxapp.app.Component.prototype.openTabDisplay = function() {
    //noop
}

haxapp.app.Component.prototype.closeTabDisplay = function() {
    //noop
}


