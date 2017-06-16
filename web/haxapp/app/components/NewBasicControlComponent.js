/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
haxapp.app.NewBasicControlComponent = function(workspaceUI,control,generator,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,control,generator,componentJson);

    this.memberUpdated();
};

haxapp.app.NewBasicControlComponent.prototype = Object.create(haxapp.app.EditComponent.prototype);
haxapp.app.NewBasicControlComponent.prototype.constructor = haxapp.app.NewBasicControlComponent;

//==============================
// Methods to Implement
//==============================

//This method must be implemented
///** This method returns the outout data display/editor for the control */
//haxapp.app.NewBasicControlComponent.prototype.getDataDisplay = function(viewMode);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.NewBasicControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.NewBasicControlComponent.VIEW_CODE = "Code";
haxapp.app.NewBasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.NewBasicControlComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.NewBasicControlComponent.VIEW_MODES = [
	haxapp.app.NewBasicControlComponent.VIEW_OUTPUT,
	haxapp.app.NewBasicControlComponent.VIEW_CODE,
    haxapp.app.NewBasicControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.NewBasicControlComponent.VIEW_DESCRIPTION
];

haxapp.app.NewBasicControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.NewBasicControlComponent.VIEW_MODES,
    "defaultView": haxapp.app.NewBasicControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
haxapp.app.NewBasicControlComponent.prototype.getTableEditSettings = function() {
    return haxapp.app.NewBasicControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.NewBasicControlComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case haxapp.app.NewBasicControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new haxapp.app.ControlOutputMode(editComponentDisplay);
			}
			return this.outputMode;
			
		case haxapp.app.NewBasicControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay);
			
		case haxapp.app.NewBasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
            
        case haxapp.app.NewBasicControlComponent.VIEW_DESCRIPTION:
			return new haxapp.app.AceDescriptionMode(editComponentDisplay);
			
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
haxapp.app.NewBasicControlComponent.createGenerator = function(displayName,uniqueName,constructorFunction) {
    
    //function to create a new component
    var createComponent = function(workspaceUI,data,resource,generator,componentOptions) {
    
        var workspace = workspaceUI.getWorkspace();
        //should throw an exception if parent is invalid!

        var json = {};
        json.action = "createMember";
        json.owner = data.parent;
        json.name = data.name;
        json.type = hax.JsonTable.generator.type;
        var actionResponse = hax.action.doAction(json);

        var control = json.member;

        if(control) {
            //set the resource
            control.updateResource(resource);

            //create the component
            var controlComponent = new constructorFunction(workspaceUI,control,generator,componentOptions);
            actionResponse.component = controlComponent;
        }
        return actionResponse;
    }

    //function to deserialize the component
    var createComponentFromJson = function(workspaceUI,member,generator,componentJson) {
        var controlComponent = new constructorFunction(workspaceUI,member,generator,componentJson);
        return controlComponent;
    }

    //generator
    var generator = {};
    generator.displayName = displayName;
    generator.uniqueName = uniqueName;
    generator.createComponent = createComponent;
    generator.createComponentFromJson = createComponentFromJson;
    generator.DEFAULT_WIDTH = 500;
    generator.DEFAULT_HEIGHT = 500;
    generator.ICON_RES_PATH = "/controlIcon.png";
    
    return generator;
}



