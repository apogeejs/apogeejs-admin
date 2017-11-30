/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
apogeeapp.app.BasicControlComponent = function(workspaceUI,control,staticComponentObject) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,control,staticComponentObject);
    
    //default to keep alive
    this.displayDestroyFlags = apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
};

apogeeapp.app.BasicControlComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.BasicControlComponent.prototype.constructor = apogeeapp.app.BasicControlComponent;

//==============================
// Methods to Implement
//==============================

//This method must be implemented
///** This method returns the outout data display/editor for the control */
//apogeeapp.app.BasicControlComponent.prototype.getDataDisplay = function(viewMode);

//==============================
// Protected and Private Instance Methods
//==============================

/** Set this value to true if the resource should not be destroyed each time
 * the display is hidden.
 */
apogeeapp.app.BasicControlComponent.prototype.setDisplayDestroyFlags = function(displayDestroyFlags) {
    this.displayDestroyFlags = displayDestroyFlags;
    
    if(this.outputMode) {
        this.outputMode.setDisplayDestroyFlags(displayDestroyFlags);
    }
}

apogeeapp.app.BasicControlComponent.VIEW_OUTPUT = "Output";
apogeeapp.app.BasicControlComponent.VIEW_CODE = "Code";
apogeeapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.BasicControlComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.BasicControlComponent.VIEW_MODES = [
	apogeeapp.app.BasicControlComponent.VIEW_OUTPUT,
	apogeeapp.app.BasicControlComponent.VIEW_CODE,
    apogeeapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.BasicControlComponent.VIEW_DESCRIPTION
];

apogeeapp.app.BasicControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.BasicControlComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.BasicControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.BasicControlComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.BasicControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.BasicControlComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.BasicControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new apogeeapp.app.ControlOutputMode(editComponentDisplay,this.displayDestroyFlags);
			}
			return this.outputMode;
			
		case apogeeapp.app.BasicControlComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        case apogeeapp.app.BasicControlComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.BasicControlComponent.getMemberCreateAction = function(userInputValues) {
    var json = {};
    json.action = "createMember";
    json.owner = userInputValues.parent;
    json.workspace = userInputValues.parent.getWorkspace();
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
    return json;
}

/** This method creates a basic generator for the extending object. */
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties = function(staticComponentObject,displayName,uniqueName) {
    staticComponentObject.displayName = displayName;
    staticComponentObject.uniqueName = uniqueName;
    staticComponentObject.createComponentFromMember = apogeeapp.app.BasicControlComponent.getMemberCreateAction;
    staticComponentObject.DEFAULT_WIDTH = 500;
    staticComponentObject.DEFAULT_HEIGHT = 500;
    staticComponentObject.ICON_RES_PATH = "/controlIcon.png";
}



