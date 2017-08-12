/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
apogeeapp.app.BasicControlComponent = function(workspaceUI,control,generator,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,control,generator,componentJson);
    
    //default to keep alive
    this.displayDestroyFlags = true;

    this.memberUpdated();
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

/** This method creates a basic generator for the extending object. */
apogeeapp.app.BasicControlComponent.createGenerator = function(displayName,uniqueName,constructorFunction) {
    
    var generator = {};
    
    //function to create a new component
    var createComponent = function(workspaceUI,data,componentOptions) {
    
        var workspace = workspaceUI.getWorkspace();
        //should throw an exception if parent is invalid!

        var json = {};
        json.action = "createMember";
        json.owner = data.parent;
        json.workspace = data.parent.getWorkspace();
        json.name = data.name;
        json.type = apogee.JsonTable.generator.type;
        var actionResponse = apogee.action.doAction(json);

        var control = json.member;

        if(control) {
            //create the component
            var controlComponent = new constructorFunction(workspaceUI,control,generator,componentOptions);
            actionResponse.component = controlComponent;
        }
        return actionResponse;
    }

    //function to deserialize the component
    var createComponentFromJson = function(workspaceUI,member,componentJson) {
        var controlComponent = new constructorFunction(workspaceUI,member,generator,componentJson);
        return controlComponent;
    }

    //generator
    generator.displayName = displayName;
    generator.uniqueName = uniqueName;
    generator.createComponent = createComponent;
    generator.createComponentFromJson = createComponentFromJson;
    generator.DEFAULT_WIDTH = 500;
    generator.DEFAULT_HEIGHT = 500;
    generator.ICON_RES_PATH = "/controlIcon.png";
    
    return generator;
}



