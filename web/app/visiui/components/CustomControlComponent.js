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
	
	//create a resource based on the json (or lack of a json)
    if((componentJson)&&(componentJson.resource)) {
        this.loadResourceFromJson(componentJson.resource);
    }
    else {
        this.loadEmptyResource();
    }
    
    //add a cleanup action to call resource when delete is happening
    var cleanupAction = function() {
        if(resource.delete) {
            resource.delete();
        }
    }
    this.addCleanupAction(cleanupAction);
};

//add components to this class
hax.core.util.mixin(hax.app.visiui.CustomControlComponent,hax.app.visiui.Component);
hax.core.util.mixin(hax.app.visiui.CustomControlComponent,hax.app.visiui.TableEditComponent);

//==============================
//Resource Accessors
//==============================

hax.app.visiui.CustomControlComponent.prototype.getHtml = function() {
    return this.html;
}

hax.app.visiui.CustomControlComponent.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

hax.app.visiui.CustomControlComponent.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

hax.app.visiui.CustomControlComponent.prototype.getCss = function(msg) {
    return this.css;
}

//==============================
// Protected and Private Instance Methods
//==============================

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
        json.resource.html = this.html;
        json.resource.customizeScript = this.customizeScript;
        json.resource.supplementalCode = this.supplementalCode;
        json.resource.css = this.css;
    }
}

/** This method deseriliazes data for the custom resource component. */
hax.app.visiui.CustomControlComponent.prototype.updateFromJson = function(json) {  
    //load resource
    if(json.resource) {
        this.loadResourceFromJson(json.resource);
    }
    else {
        this.loadEmptyResource();
    }
}

hax.app.visiui.CustomControlComponent.prototype.loadEmptyResource = function() {
	this.update("","return {};","","");
}

/** This method deseriliazes data for the custom resource component. */
hax.app.visiui.CustomControlComponent.prototype.loadResourceFromJson = function(json) {   
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

hax.app.visiui.CustomControlComponent.prototype.update = function(html,customizeScript,supplementalCode,css) {
    this.html = html;
	this.customizeScript = customizeScript;
	this.supplementalCode = supplementalCode;
	this.css = css;
    
	var actionResponse = new hax.core.ActionResponse();
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
        
        control.calculate();
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
// Resource methods
//======================================

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
hax.app.visiui.CustomControlComponent.prototype.createResource = function() {
    
    //create the resource generator wrapped with its closure
    var generatorFunctionBody = hax.core.util.formatString(
        hax.app.visiui.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
		this.customizeScript,
        this.supplementalCode
    );
	
	//create the function generator, with the aliased variables in the closure
	var generatorFunction = new Function(generatorFunctionBody);
	var updateFunction = generatorFunction();
	
    var resource = updateFunction(this);
    return resource;
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: customize script
 * 1: supplemental code text
 * @private
 */
hax.app.visiui.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
"",
"//supplemental code",
"{1}",
"//end supplemental code",
"",
"//member function",
"var generator = function(component) {",
"{0}",
"}",
"//end member function",
"return generator;",
""
   ].join("\n");





//======================================
// Static methods
//======================================


/** This method creates the control. */
hax.app.visiui.CustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
	var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
	//create a generic component of this given name
    var json = {};
    json.name = data.name;
    json.type = hax.core.Control.generator.type;
    var actionResponse = hax.core.createmember.createMember(parent,json);
    var control = actionResponse.member;
	
    if(control) {
        //create the component
        var customControlComponent = new hax.app.visiui.CustomControlComponent.createComponentFromJson(workspaceUI,control,componentOptions);
        actionResponse.component = customControlComponent;
    }
    return actionResponse;
}

hax.app.visiui.CustomControlComponent.createComponentFromJson = function(workspaceUI,control,componentJson) {
    var customControlComponent = new hax.app.visiui.CustomControlComponent(workspaceUI,control,componentJson);
    return customControlComponent;
}


//======================================
// This is the control generator, to register the control
//======================================

hax.app.visiui.CustomControlComponent.generator = {};
hax.app.visiui.CustomControlComponent.generator.displayName = "Custom Control";
hax.app.visiui.CustomControlComponent.generator.uniqueName = "hax.app.visiui.CustomControlComponent";
hax.app.visiui.CustomControlComponent.generator.createComponent = hax.app.visiui.CustomControlComponent.createComponent;
hax.app.visiui.CustomControlComponent.generator.createComponentFromJson = hax.app.visiui.CustomControlComponent.createComponentFromJson;
hax.app.visiui.CustomControlComponent.generator.DEFAULT_WIDTH = 500;
hax.app.visiui.CustomControlComponent.generator.DEFAULT_HEIGHT = 500;

