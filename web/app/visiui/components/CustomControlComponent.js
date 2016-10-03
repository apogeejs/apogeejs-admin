/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
hax.app.visiui.CustomControlComponent = function(workspaceUI,control,componentJson) {
    //base init
    hax.app.visiui.Component.init.call(this,workspaceUI,control,hax.app.visiui.CustomControlComponent.generator,componentJson);
	hax.app.visiui.TableEditComponent.init.call(this,
		hax.app.visiui.CustomControlComponent.VIEW_MODES,
		hax.app.visiui.CustomControlComponent.DEFAULT_VIEW
	);
};

//add components to this class
hax.core.util.mixin(hax.app.visiui.CustomControlComponent,hax.app.visiui.Component);
hax.core.util.mixin(hax.app.visiui.CustomControlComponent,hax.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

hax.app.visiui.CustomControlComponent.prototype.initEmptyResource = function() {
	this.update("","","","");
}

hax.app.visiui.CustomControlComponent.prototype.getOutputElement = function() {
	return this.outputMode.getElement();
}

hax.app.visiui.CustomControlComponent.VIEW_OUTPUT = "Output";
hax.app.visiui.CustomControlComponent.VIEW_CODE = "Model Code";
hax.app.visiui.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
hax.app.visiui.CustomControlComponent.VIEW_CUSTOM_CODE = "Base Code";
hax.app.visiui.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE = "Base Private";

hax.app.visiui.CustomControlComponent.VIEW_MODES = [
	hax.app.visiui.CustomControlComponent.VIEW_OUTPUT,
	hax.app.visiui.CustomControlComponent.VIEW_CODE,
    hax.app.visiui.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    hax.app.visiui.CustomControlComponent.VIEW_CUSTOM_CODE,
    hax.app.visiui.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE
];

hax.app.visiui.CustomControlComponent.DEFAULT_VIEW = hax.app.visiui.CustomControlComponent.VIEW_OUTPUT;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
hax.app.visiui.CustomControlComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case hax.app.visiui.CustomControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new hax.app.visiui.ResourceOutputMode(this);
			}
			return this.outputMode;
			
		case hax.app.visiui.CustomControlComponent.VIEW_CODE:
			return new hax.app.visiui.AceCodeMode(this,false);
			
		case hax.app.visiui.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new hax.app.visiui.AceSupplementalMode(this);
			
		case hax.app.visiui.CustomControlComponent.VIEW_CUSTOM_CODE:
			return new hax.app.visiui.AceCustomCodeMode(this);
			
		case hax.app.visiui.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE:
			return new hax.app.visiui.AceCustomSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This serializes the table component. */
hax.app.visiui.CustomControlComponent.prototype.writeToJson = function(json) {
    //store the resource info
    var control = this.getObject();
	var resource = control.getResource();
    if(resource) {
        json.resource = {};
        json.resource.html = resource.getHtml();
        json.resource.customizeScript = resource.getCustomizeScript();
        json.resource.supplementalCode = resource.getSupplementalCode();
        json.resource.css = resource.getCss();
    }
}

/** This method deseriliazes data for the custom resource component. */
hax.app.visiui.CustomControlComponent.prototype.updateFromJson = function(json) {   
    //internal data
    if(json.resource) {
        this.update(json.resource.html,
            json.resource.customizeScript,
            json.resource.supplementalCode,
            json.resource.css);
    }
    else {
        this.initEmptyResource();
    }
    
}

//=============================
// Action
//=============================

hax.app.visiui.CustomControlComponent.prototype.update = function(html,resourceGeneratorBody,supplementalCode,css) {
	var actionResponse = new hax.core.ActionResponse();
    var control = this.getObject();
    control.clearErrors("Custom Control - Update");
    
    try { 
        //create a new resource
        var newResource = new hax.app.visiui.CustomResource();
        newResource.setComponent(this);

        //update it
        newResource.update(html,resourceGeneratorBody,supplementalCode,css);

        //update the resource
        control.updateResource(newResource);

        this.memberUpdated();
    }
    catch(error) {
        //user application error
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = error.message ? error.message : hax.core.ActionError.UNKNOWN_ERROR_MESSAGE;
        var actionError = new hax.core.ActionError(errorMsg,"Custom Control - Update",control);
        actionError.setParentException(error);
        
        control.addError(actionError);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}


//======================================
// Static methods
//======================================

//add table listener
hax.app.visiui.CustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.core.Control.generator.type;
    var actionResponse = hax.core.createmember.createMember(parent,json);
    
    var control = actionResponse.member;
    if(control) {
        //create the component
        var customControlComponent = new hax.app.visiui.CustomControlComponent(workspaceUI,control,componentOptions);
        actionResponse.component = customControlComponent;
        
        //if we do not load from a json, we must manually set the resource
        //this is because here we store resource data in the JSON. If we try creating
        //an empty one it might not be compatible with the existing initializer code int
        //the resource. 
        //In cases where the resource does not save data in the json, which
        //is the typical scenario, then this is not an issue.
        customControlComponent.initEmptyResource(); 
    }
    return actionResponse;
}


hax.app.visiui.CustomControlComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    
    var customControlComponent = new hax.app.visiui.CustomControlComponent(workspaceUI,member,componentJson);
    if(componentJson) {
        customControlComponent.updateFromJson(componentJson);
    }
    else {
        customControlComponent.initEmptyResource();
    }
    
    return customControlComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

hax.app.visiui.CustomControlComponent.generator = {};
hax.app.visiui.CustomControlComponent.generator.displayName = "Custom Control";
hax.app.visiui.CustomControlComponent.generator.uniqueName = "hax.app.visiui.CustomControlComponent";
hax.app.visiui.CustomControlComponent.generator.createComponent = hax.app.visiui.CustomControlComponent.createComponent;
hax.app.visiui.CustomControlComponent.generator.createComponentFromJson = hax.app.visiui.CustomControlComponent.createComponentFromJson;
hax.app.visiui.CustomControlComponent.generator.DEFAULT_WIDTH = 500;
hax.app.visiui.CustomControlComponent.generator.DEFAULT_HEIGHT = 300;

