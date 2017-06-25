/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
haxapp.app.BasicControlComponent = function(workspaceUI,control,generator,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,control,generator,componentJson);
    
    //default to keep alive
    this.doKeepAlive = true;

    this.memberUpdated();
};

haxapp.app.BasicControlComponent.prototype = Object.create(haxapp.app.EditComponent.prototype);
haxapp.app.BasicControlComponent.prototype.constructor = haxapp.app.BasicControlComponent;

//==============================
// Methods to Implement
//==============================

//This method must be implemented
///** This method returns the outout data display/editor for the control */
//haxapp.app.BasicControlComponent.prototype.getDataDisplay = function(viewMode);

//==============================
// Protected and Private Instance Methods
//==============================

/** Set this value to true if the resource should not be destroyed each time
 * the display is hidden.
 */
haxapp.app.BasicControlComponent.prototype.setDoKeepAlive = function(doKeepAlive) {
    this.doKeepAlive = doKeepAlive;
    
    if(this.outputMode) {
        this.outputMode.setDoKeepAlive(doKeepAlive);
    }
}

haxapp.app.BasicControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.BasicControlComponent.VIEW_CODE = "Code";
haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.BasicControlComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.BasicControlComponent.VIEW_MODES = [
	haxapp.app.BasicControlComponent.VIEW_OUTPUT,
	haxapp.app.BasicControlComponent.VIEW_CODE,
    haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.BasicControlComponent.VIEW_DESCRIPTION
];

haxapp.app.BasicControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.BasicControlComponent.VIEW_MODES,
    "defaultView": haxapp.app.BasicControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
haxapp.app.BasicControlComponent.prototype.getTableEditSettings = function() {
    return haxapp.app.BasicControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.BasicControlComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case haxapp.app.BasicControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new haxapp.app.ControlOutputMode(editComponentDisplay,this.doKeepAlive);
			}
			return this.outputMode;
			
		case haxapp.app.BasicControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay);
			
		case haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
            
        case haxapp.app.BasicControlComponent.VIEW_DESCRIPTION:
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
haxapp.app.BasicControlComponent.createGenerator = function(displayName,uniqueName,constructorFunction) {
    
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
        json.type = hax.JsonTable.generator.type;
        var actionResponse = hax.action.doAction(json);

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



