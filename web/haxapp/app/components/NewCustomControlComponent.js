/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
haxapp.app.NewCustomControlComponent = function(workspaceUI,control,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,control,haxapp.app.NewCustomControlComponent.generator,componentJson);
    
    this.loadResourceFromJson(componentJson);
	
	this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(haxapp.app.NewCustomControlComponent.writeToJson);
};

haxapp.app.NewCustomControlComponent.prototype = Object.create(haxapp.app.EditComponent.prototype);
haxapp.app.NewCustomControlComponent.prototype.constructor = haxapp.app.NewCustomControlComponent;

//==============================
//Resource Accessors
//==============================

haxapp.app.NewCustomControlComponent.prototype.createResource = function() {
    //create the resource generator wrapped with its closure
    var generatorFunctionBody = hax.util.formatString(
        haxapp.app.NewCustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
		this.customizeScript,
        this.supplementalCode
    );
	
	//create the function generator, with the aliased variables in the closure
	var generatorFunction = new Function(generatorFunctionBody);
	var resourceFunction = generatorFunction();
	
    var resource = resourceFunction();
    
    //-----------------------------
    //temporary code - to make sure this is valid.
    if(!resource.showData) {
        resource.showData = function() {};
    }
    if(!resource.getElement) {
        resource.getElement = function() {
            if(!resource.element) {
                resource.element = document.createElement("div");
            }
            return resource.element;
        }
    }
    //--------------------------

    return resource;
}

haxapp.app.NewCustomControlComponent.prototype.getHtml = function() {
    return this.html;
}

haxapp.app.NewCustomControlComponent.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

haxapp.app.NewCustomControlComponent.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

haxapp.app.NewCustomControlComponent.prototype.getCss = function(msg) {
    return this.css;
}

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.NewCustomControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.NewCustomControlComponent.VIEW_CODE = "Model Code";
haxapp.app.NewCustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.NewCustomControlComponent.VIEW_CUSTOM_CODE = "Base Code";
haxapp.app.NewCustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE = "Base Private";
haxapp.app.NewCustomControlComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.NewCustomControlComponent.VIEW_MODES = [
	haxapp.app.NewCustomControlComponent.VIEW_OUTPUT,
	haxapp.app.NewCustomControlComponent.VIEW_CODE,
    haxapp.app.NewCustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.NewCustomControlComponent.VIEW_CUSTOM_CODE,
    haxapp.app.NewCustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE,
    haxapp.app.NewCustomControlComponent.VIEW_DESCRIPTION
];

haxapp.app.NewCustomControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.NewCustomControlComponent.VIEW_MODES,
    "defaultView": haxapp.app.NewCustomControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
haxapp.app.NewCustomControlComponent.prototype.getTableEditSettings = function() {
    return haxapp.app.NewCustomControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.NewCustomControlComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case haxapp.app.NewCustomControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new haxapp.app.NewResourceOutputMode(editComponentDisplay);
			}
			return this.outputMode;
			
		case haxapp.app.NewCustomControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay);
			
		case haxapp.app.NewCustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
			
		case haxapp.app.NewCustomControlComponent.VIEW_CUSTOM_CODE:
			return new haxapp.app.AceCustomCodeMode(editComponentDisplay);
			
		case haxapp.app.NewCustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceCustomSupplementalMode(editComponentDisplay);
            
        case haxapp.app.NewCustomControlComponent.VIEW_DESCRIPTION:
			return new haxapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This method deseriliazes data for the custom resource component. */
haxapp.app.NewCustomControlComponent.prototype.updateFromJson = function(json) {  
    //load resource
    if(json.resource) {
        this.loadResourceFromJson(json.resource);
    }
    else {
        this.loadEmptyResource();
    }
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
haxapp.app.NewCustomControlComponent.prototype.loadResourceFromJson = function(json) {   
    var resourceJson;
	if((!json)||(!json.resource)) {
		resourceJson = {};
	} 
	else {
		resourceJson = json.resource;
	}
    
	this.html = (resourceJson.html !== undefined) ? resourceJson.html : "";
	this.customizeScript = (resourceJson.customizeScript !== undefined) ? resourceJson.customizeScript : "return {};";
	this.supplementalCode = (resourceJson.supplementalCode !== undefined) ? resourceJson.supplementalCode : "";
	this.css = (resourceJson.css === undefined) ? resourceJson.css : "";     
}

//=============================
// Action
//=============================

haxapp.app.NewCustomControlComponent.prototype.update = function(html,customizeScript,supplementalCode,css) {
    this.html = html;
	this.customizeScript = customizeScript;
	this.supplementalCode = supplementalCode;
	this.css = css;
    
	var actionResponse = new hax.ActionResponse();
//    
//    try { 
//        //create a new resource
//        this.createResource();
//    }
//    catch(error) {
//        var errorMsg = error.message ? error.message : hax.ActionError.UNKNOWN_ERROR_MESSAGE;
//        var actionError = new hax.ActionError(errorMsg,"Custom Control - Update",control);
//        actionError.setParentException(error);
//        
//        actionResponse.addError(actionError);
//    }
    
    return actionResponse; 
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the table component. */
haxapp.app.NewCustomControlComponent.writeToJson = function(json) {
    //store the resource info
    json.resource = {};
    json.resource.html = this.html;
    json.resource.customizeScript = this.customizeScript;
    json.resource.supplementalCode = this.supplementalCode;
    json.resource.css = this.css;
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: customize script
 * 1: supplemental code text
 * @private
 */
haxapp.app.NewCustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
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
haxapp.app.NewCustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.name = data.name;
    json.type = hax.JsonTable.generator.type;
    var actionResponse = hax.action.doAction(json);
    
    var control = json.member;
    
    if(control) {
        //create the component
        var customControlComponent = new haxapp.app.NewCustomControlComponent.createComponentFromJson(workspaceUI,control,componentOptions);
        actionResponse.component = customControlComponent;
    }
    return actionResponse;
}

haxapp.app.NewCustomControlComponent.createComponentFromJson = function(workspaceUI,control,componentJson) {
    var customControlComponent = new haxapp.app.NewCustomControlComponent(workspaceUI,control,componentJson);
    return customControlComponent;
}


//======================================
// This is the control generator, to register the control
//======================================

haxapp.app.NewCustomControlComponent.generator = {};
haxapp.app.NewCustomControlComponent.generator.displayName = "Custom Control";
haxapp.app.NewCustomControlComponent.generator.uniqueName = "haxapp.app.NewCustomControlComponent";
haxapp.app.NewCustomControlComponent.generator.createComponent = haxapp.app.NewCustomControlComponent.createComponent;
haxapp.app.NewCustomControlComponent.generator.createComponentFromJson = haxapp.app.NewCustomControlComponent.createComponentFromJson;
haxapp.app.NewCustomControlComponent.generator.DEFAULT_WIDTH = 500;
haxapp.app.NewCustomControlComponent.generator.DEFAULT_HEIGHT = 500;
haxapp.app.NewCustomControlComponent.generator.ICON_RES_PATH = "/controlIcon.png";

