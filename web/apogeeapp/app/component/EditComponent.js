/** This is the base class for a editable component (an object with code or data),
 * It extends the component class. */
apogeeapp.app.EditComponent = function(workspaceUI,member,componentGenerator) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,member,componentGenerator);
}

apogeeapp.app.EditComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.EditComponent.prototype.constructor = apogeeapp.app.EditComponent;

/** This is used to flag this as an edit component. */
apogeeapp.app.EditComponent.prototype.isEditComponent = true;

//===============================
// Protected Functions
//===============================

//Implement this in extending class
///**  This method retrieves the table edit settings for this component instance
// * @protected */
//apogeeapp.app.EditComponent.prototype.getTableEditSettings = function();

apogeeapp.app.EditComponent.prototype.usesTabDisplay = function() {    
    return false;
}

apogeeapp.app.EditComponent.prototype.instantiateTabDisplay = function() {
    return null;
}


