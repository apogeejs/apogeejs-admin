/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
haxapp.app.CustomControlComponent = function(workspaceUI,control,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,control,haxapp.app.CustomControlComponent.generator,componentJson);
	
	//create a resource based on the json (or lack of a json)
    if((componentJson)&&(componentJson.resource)) {
        this.loadResourceFromJson(componentJson.resource);
    }
    else {
        this.loadEmptyResource();
    }
    
    //add a cleanup and save actions
    this.addSaveAction(haxapp.app.CustomControlComponent.writeToJson);
};

haxapp.app.CustomControlComponent.prototype = Object.create(haxapp.app.EditComponent.prototype);
haxapp.app.CustomControlComponent.prototype.constructor = haxapp.app.CustomControlComponent;

//==============================
//Resource Accessors
//==============================

haxapp.app.CustomControlComponent.prototype.getHtml = function() {
    return this.html;
}

haxapp.app.CustomControlComponent.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

haxapp.app.CustomControlComponent.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

haxapp.app.CustomControlComponent.prototype.getCss = function(msg) {
    return this.css;
}

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.CustomControlComponent.prototype.getOutputElement = function() {
	return this.outputMode.getElement();
}

haxapp.app.CustomControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.CustomControlComponent.VIEW_CODE = "Model Code";
haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.CustomControlComponent.VIEW_CUSTOM_CODE = "Base Code";
haxapp.app.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE = "Base Private";
haxapp.app.CustomControlComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.CustomControlComponent.VIEW_MODES = [
	haxapp.app.CustomControlComponent.VIEW_OUTPUT,
	haxapp.app.CustomControlComponent.VIEW_CODE,
    haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.CustomControlComponent.VIEW_CUSTOM_CODE,
    haxapp.app.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE,
    haxapp.app.CustomControlComponent.VIEW_DESCRIPTION
];

haxapp.app.CustomControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.CustomControlComponent.VIEW_MODES,
    "defaultView": haxapp.app.CustomControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
haxapp.app.CustomControlComponent.prototype.getTableEditSettings = function() {
    return haxapp.app.CustomControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.CustomControlComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case haxapp.app.CustomControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new haxapp.app.ResourceOutputMode(editComponentDisplay);
			}
			return this.outputMode;
			
		case haxapp.app.CustomControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay);
			
		case haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
			
		case haxapp.app.CustomControlComponent.VIEW_CUSTOM_CODE:
			return new haxapp.app.AceCustomCodeMode(editComponentDisplay);
			
		case haxapp.app.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceCustomSupplementalMode(editComponentDisplay);
            
        case haxapp.app.CustomControlComponent.VIEW_DESCRIPTION:
			return new haxapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This method deseriliazes data for the custom resource component. */
haxapp.app.CustomControlComponent.prototype.updateFromJson = function(json) {  
    //load resource
    if(json.resource) {
        this.loadResourceFromJson(json.resource);
    }
    else {
        this.loadEmptyResource();
    }
}

haxapp.app.CustomControlComponent.prototype.loadEmptyResource = function() {
	this.update("","return {};","","");
}

/** This method deseriliazes data for the custom resource component. */
haxapp.app.CustomControlComponent.prototype.loadResourceFromJson = function(json) {   
	if(!json) json = {};
	var html = (json.html !== undefined) ? json.html : "";
	var customizeScript = (json.customizeScript !== undefined) ? json.customizeScript : "";
	var supplementalCode = (json.supplementalCode !== undefined) ? json.supplementalCode : "";
	var css = (json.css === undefined) ? json.css : "";
	
    this.update(html,customizeScript,supplementalCode,css);    
}

//=============================
// Action
//=============================

haxapp.app.CustomControlComponent.prototype.update = function(html,customizeScript,supplementalCode,css) {
    this.html = html;
	this.customizeScript = customizeScript;
	this.supplementalCode = supplementalCode;
	this.css = css;
    
	var actionResponse = new hax.ActionResponse();
    var control = this.getObject();
    control.clearErrors();
    
    try { 
        //create a new resource
        var resource = this.createResource();
        if(!resource) {
            throw new Error("resource.setComponent(component) is not defined");
        }

        //update the resource
        control.updateResource(resource);
        
        if(resource.setComponent) {
            resource.setComponent(this);
        }
        
        control.prepareForCalculate();
        control.calculate();
        this.memberUpdated();
    }
    catch(error) {
        //user application error
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = error.message ? error.message : hax.ActionError.UNKNOWN_ERROR_MESSAGE;
        var actionError = new hax.ActionError(errorMsg,"Custom Control - Update",control);
        actionError.setParentException(error);
        
        control.addError(actionError);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the table component. */
haxapp.app.CustomControlComponent.writeToJson = function(json) {
    //store the resource info
    var control = this.getObject();
	var resource = control.getResource();
    if(resource) {
        json.resource = {};
        json.resource.html = this.html;
        json.resource.customizeScript = this.customizeScript;
        json.resource.supplementalCode = this.supplementalCode;
        json.resource.css = this.css;
    }
}


//======================================
// Resource methods
//======================================

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
haxapp.app.CustomControlComponent.prototype.createResource = function() {
    
    //create the resource generator wrapped with its closure
    var generatorFunctionBody = hax.util.formatString(
        haxapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
		this.customizeScript,
        this.supplementalCode
    );
	
	//create the function generator, with the aliased variables in the closure
	var generatorFunction = new Function(generatorFunctionBody);
	var resourceFunction = generatorFunction();
	
    var resource = resourceFunction(this);
    return resource;
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: customize script
 * 1: supplemental code text
 * @private
 */
haxapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
"",
"//supplemental code",
"{1}",
"//end supplemental code",
"",
"//member function",
"var resourceFunction = function(component) {",
"var resource = {};",
"{0}",
"return resource;",
"}",
"//end member function",
"return resourceFunction;",
""
   ].join("\n");





//======================================
// Static methods
//======================================


/** This method creates the control. */
haxapp.app.CustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.name = data.name;
    json.type = hax.Control.generator.type;
    var actionResponse = hax.action.doAction(json);
    
    var control = json.member;
    
    if(control) {
        //create the component
        var customControlComponent = new haxapp.app.CustomControlComponent.createComponentFromJson(workspaceUI,control,componentOptions);
        actionResponse.component = customControlComponent;
    }
    return actionResponse;
}

haxapp.app.CustomControlComponent.createComponentFromJson = function(workspaceUI,control,componentJson) {
    var customControlComponent = new haxapp.app.CustomControlComponent(workspaceUI,control,componentJson);
    return customControlComponent;
}


//======================================
// This is the control generator, to register the control
//======================================

haxapp.app.CustomControlComponent.generator = {};
haxapp.app.CustomControlComponent.generator.displayName = "Custom Control";
haxapp.app.CustomControlComponent.generator.uniqueName = "haxapp.app.CustomControlComponent";
haxapp.app.CustomControlComponent.generator.createComponent = haxapp.app.CustomControlComponent.createComponent;
haxapp.app.CustomControlComponent.generator.createComponentFromJson = haxapp.app.CustomControlComponent.createComponentFromJson;
haxapp.app.CustomControlComponent.generator.DEFAULT_WIDTH = 500;
haxapp.app.CustomControlComponent.generator.DEFAULT_HEIGHT = 500;
haxapp.app.CustomControlComponent.generator.ICON_RES_PATH = "/controlIcon.png";

