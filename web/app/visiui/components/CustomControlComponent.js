/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
visicomp.app.visiui.CustomControlComponent = function(workspaceUI,control,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,control,visicomp.app.visiui.CustomControlComponent.generator,componentJson);
	visicomp.app.visiui.TableEditComponent.init.call(this,
		visicomp.app.visiui.CustomControlComponent.VIEW_MODES,
		visicomp.app.visiui.CustomControlComponent.DEFAULT_VIEW
	);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.CustomControlComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.CustomControlComponent,visicomp.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

visicomp.app.visiui.CustomControlComponent.prototype.initEmptyResource = function() {
	this.update("","","","");
}

visicomp.app.visiui.CustomControlComponent.prototype.getOutputElement = function() {
	return this.outputMode.getElement();
}

visicomp.app.visiui.CustomControlComponent.VIEW_OUTPUT = "Output";
visicomp.app.visiui.CustomControlComponent.VIEW_CODE = "Model Code";
visicomp.app.visiui.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
visicomp.app.visiui.CustomControlComponent.VIEW_CUSTOM_CODE = "Base Code";
visicomp.app.visiui.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE = "Base Private";

visicomp.app.visiui.CustomControlComponent.VIEW_MODES = [
	visicomp.app.visiui.CustomControlComponent.VIEW_OUTPUT,
	visicomp.app.visiui.CustomControlComponent.VIEW_CODE,
    visicomp.app.visiui.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    visicomp.app.visiui.CustomControlComponent.VIEW_CUSTOM_CODE,
    visicomp.app.visiui.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE
];

visicomp.app.visiui.CustomControlComponent.DEFAULT_VIEW = visicomp.app.visiui.CustomControlComponent.VIEW_OUTPUT;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
visicomp.app.visiui.CustomControlComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case visicomp.app.visiui.CustomControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new visicomp.app.visiui.ResourceOutputMode(this);
			}
			return this.outputMode;
			
		case visicomp.app.visiui.CustomControlComponent.VIEW_CODE:
			return new visicomp.app.visiui.AceCodeMode(this);
			
		case visicomp.app.visiui.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new visicomp.app.visiui.AceSupplementalMode(this);
			
		case visicomp.app.visiui.CustomControlComponent.VIEW_CUSTOM_CODE:
			return new visicomp.app.visiui.AceCustomCodeMode(this);
			
		case visicomp.app.visiui.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE:
			return new visicomp.app.visiui.AceCustomSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This serializes the table component. */
visicomp.app.visiui.CustomControlComponent.prototype.writeToJson = function(json) {
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
visicomp.app.visiui.CustomControlComponent.prototype.updateFromJson = function(json) {   
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

visicomp.app.visiui.CustomControlComponent.prototype.update = function(html,resourceGeneratorBody,supplementalCode,css) {
	var actionResponse = new visicomp.core.ActionResponse();
    var control = this.getObject();
    control.clearErrors("Custom Control - Update");
    
    try { 
        //create a new resource
        var newResource = new visicomp.app.visiui.CustomResource();
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
        var errorMsg = error.message ? error.message : visicomp.core.ActionError.UNKNOWN_ERROR_MESSAGE;
        var actionError = new visicomp.core.ActionError(errorMsg,"Custom Control - Update",control);
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
visicomp.app.visiui.CustomControlComponent.createComponent = function(workspaceUI,parent,name) {
    var json = {};
    json.name = name;
    json.type = visicomp.core.Control.generator.type;
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var control = actionResponse.member;
    if(control) {
        //create the component
        var customControlComponent = new visicomp.app.visiui.CustomControlComponent(workspaceUI,control);
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


visicomp.app.visiui.CustomControlComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    
    var customControlComponent = new visicomp.app.visiui.CustomControlComponent(workspaceUI,member,componentJson);
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

visicomp.app.visiui.CustomControlComponent.generator = {};
visicomp.app.visiui.CustomControlComponent.generator.displayName = "Custom Control";
visicomp.app.visiui.CustomControlComponent.generator.uniqueName = "visicomp.app.visiui.CustomControlComponent";
visicomp.app.visiui.CustomControlComponent.generator.createComponent = visicomp.app.visiui.CustomControlComponent.createComponent;
visicomp.app.visiui.CustomControlComponent.generator.createComponentFromJson = visicomp.app.visiui.CustomControlComponent.createComponentFromJson;
visicomp.app.visiui.CustomControlComponent.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.CustomControlComponent.generator.DEFAULT_HEIGHT = 300;

