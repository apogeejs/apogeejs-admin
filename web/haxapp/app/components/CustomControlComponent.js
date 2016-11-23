/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
haxapp.app.CustomControlComponent = function(workspaceUI,control,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,control,haxapp.app.CustomControlComponent.generator,componentJson);
	haxapp.app.TableEditComponent.init.call(this,
		haxapp.app.CustomControlComponent.VIEW_MODES,
		haxapp.app.CustomControlComponent.DEFAULT_VIEW
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
hax.util.mixin(haxapp.app.CustomControlComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.CustomControlComponent,haxapp.app.TableEditComponent);

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

haxapp.app.CustomControlComponent.VIEW_MODES = [
	haxapp.app.CustomControlComponent.VIEW_OUTPUT,
	haxapp.app.CustomControlComponent.VIEW_CODE,
    haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.CustomControlComponent.VIEW_CUSTOM_CODE,
    haxapp.app.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE
];

haxapp.app.CustomControlComponent.DEFAULT_VIEW = haxapp.app.CustomControlComponent.VIEW_OUTPUT;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.CustomControlComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case haxapp.app.CustomControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new haxapp.app.ResourceOutputMode(this);
			}
			return this.outputMode;
			
		case haxapp.app.CustomControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,false);
			
		case haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(this);
			
		case haxapp.app.CustomControlComponent.VIEW_CUSTOM_CODE:
			return new haxapp.app.AceCustomCodeMode(this);
			
		case haxapp.app.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceCustomSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This serializes the table component. */
haxapp.app.CustomControlComponent.prototype.writeToJson = function(json) {
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
haxapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
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
haxapp.app.CustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
	var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
	//create a generic component of this given name
    var json = {};
    json.name = data.name;
    json.type = hax.Control.generator.type;
    var actionResponse = hax.createmember.createMember(parent,json);
    var control = actionResponse.member;
	
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

