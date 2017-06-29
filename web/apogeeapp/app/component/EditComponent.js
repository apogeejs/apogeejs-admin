/** This is the base class for a editable component (an object with code or data),
 * It extends the component class. */
apogeeapp.app.EditComponent = function(workspaceUI,object,generator,options) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,object,generator,options);
}

apogeeapp.app.EditComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.EditComponent.prototype.constructor = apogeeapp.app.EditComponent;

apogeeapp.app.EditComponent.prototype.createWindowDisplay = function() {
    if(this.windowDisplay == null) {
        this.windowDisplay = new apogeeapp.app.EditWindowComponentDisplay(this,this.windowDisplayStateJson);
    }
    else if(this.windowStateJson) {
        this.windowDisplay.setStateJson(this.windowStateJson);
    }
    return this.windowDisplay;
}

/** This is used when an alternate UI is used for the workspace. This replaces the window display 
 *  used in the standard UI. */
apogeeapp.app.EditComponent.prototype.setAlternateWindowDisplay = function(windowDisplay) {
    this.windowDisplay = windowDisplay;
}

//===============================
// Protected Functions
//===============================

//Implement this in extending class
///**  This method retrieves the table edit settings for this component instance
// * @protected */
//apogeeapp.app.EditComponent.prototype.getTableEditSettings = function();

apogeeapp.app.Component.prototype.hasTabDisplay = function() {    
    return false;
}

apogeeapp.app.Component.prototype.openTabDisplay = function() {
    //noop
}

apogeeapp.app.Component.prototype.closeTabDisplay = function() {
    //noop
}


