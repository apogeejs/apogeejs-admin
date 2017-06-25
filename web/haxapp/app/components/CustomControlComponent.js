/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
haxapp.app.CustomControlComponent = function(workspaceUI,control,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,control,haxapp.app.CustomControlComponent.generator,componentJson);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    this.loadResourceFromJson(componentJson);
    
    //create a resource based on the json (or lack of a json)
    if((componentJson)&&(componentJson.doKeepAlive)) {
        this.doKeepAlive = true;
    }
    else {
        this.doKeepAlive = false;
    }
	
	this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(haxapp.app.CustomControlComponent.writeToJson);
};

haxapp.app.CustomControlComponent.prototype = Object.create(haxapp.app.EditComponent.prototype);
haxapp.app.CustomControlComponent.prototype.constructor = haxapp.app.CustomControlComponent;

//==============================
//Resource Accessors
//==============================

haxapp.app.CustomControlComponent.prototype.getDataDisplay = function(viewMode) {
    var html = this.getUiCodeField(haxapp.app.CustomControlComponent.CODE_FIELD_HTML);
    var resource = this.createResource();
    var dataDisplay = new haxapp.app.HtmlJsDataDisplay(html,resource,viewMode);
    return dataDisplay;
}

haxapp.app.CustomControlComponent.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

haxapp.app.CustomControlComponent.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

haxapp.app.CustomControlComponent.prototype.getDoKeepAlive = function() {
    return this.doKeepAlive;
}

haxapp.app.CustomControlComponent.prototype.setDoKeepAlive = function(doKeepAlive) {
    this.doKeepAlive = doKeepAlive;
    
    if(this.outputMode) {
        this.outputMode.setDoKeepAlive(doKeepAlive);
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.CustomControlComponent.CODE_FIELD_HTML = "html";
haxapp.app.CustomControlComponent.CODE_FIELD_CSS = "css";
haxapp.app.CustomControlComponent.CODE_FIELD_INIT = "init";
haxapp.app.CustomControlComponent.CODE_FIELD_SET_DATA = "setData";
haxapp.app.CustomControlComponent.CODE_FIELD_ON_HIDE = "onHide";
haxapp.app.CustomControlComponent.CODE_FIELD_DESTROY = "destroy";
haxapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD = "onLoad";
haxapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE = "onResize";
haxapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR = "constructorAddition";

haxapp.app.CustomControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.CustomControlComponent.VIEW_CODE = "Model Code";
haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.CustomControlComponent.VIEW_HTML = "HTML";
haxapp.app.CustomControlComponent.VIEW_CSS = "CSS";
haxapp.app.CustomControlComponent.VIEW_INIT = "init(element,mode)";
haxapp.app.CustomControlComponent.VIEW_SET_DATA = "setData(data,element,mode)";
haxapp.app.CustomControlComponent.VIEW_ON_HIDE = "onHide(element,mode)";
haxapp.app.CustomControlComponent.VIEW_DESTROY = "destroy(element,mode)";
haxapp.app.CustomControlComponent.VIEW_ON_LOAD = "onLoad(element,mode)";
haxapp.app.CustomControlComponent.VIEW_ON_RESIZE = "onResize(element,mode)";
haxapp.app.CustomControlComponent.VIEW_CONSTRUCTOR = "constructor(mode)";
haxapp.app.CustomControlComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.CustomControlComponent.VIEW_MODES = [
	haxapp.app.CustomControlComponent.VIEW_OUTPUT,
	haxapp.app.CustomControlComponent.VIEW_CODE,
    haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.CustomControlComponent.VIEW_HTML,
    haxapp.app.CustomControlComponent.VIEW_CSS,
    haxapp.app.CustomControlComponent.VIEW_INIT,
    haxapp.app.CustomControlComponent.VIEW_SET_DATA,
    haxapp.app.CustomControlComponent.VIEW_ON_HIDE,
    haxapp.app.CustomControlComponent.VIEW_DESTROY,
    haxapp.app.CustomControlComponent.VIEW_ON_LOAD,
    haxapp.app.CustomControlComponent.VIEW_ON_RESIZE,
    haxapp.app.CustomControlComponent.VIEW_CONSTRUCTOR,
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
				this.outputMode = new haxapp.app.ControlOutputMode(editComponentDisplay,this.doKeepAlive);
			}
			return this.outputMode;
			
		case haxapp.app.CustomControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay);
			
		case haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
            
        
        case haxapp.app.CustomControlComponent.VIEW_HTML:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_HTML);
    
        case haxapp.app.CustomControlComponent.VIEW_CSS:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_CSS);
            
        case haxapp.app.CustomControlComponent.VIEW_INIT:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_INIT);
    
        case haxapp.app.CustomControlComponent.VIEW_SET_DATA:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_SET_DATA);
     
        case haxapp.app.CustomControlComponent.VIEW_ON_HIDE:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_ON_HIDE);    
            
        case haxapp.app.CustomControlComponent.VIEW_DESTROY:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_DESTROY);    
            
        case haxapp.app.CustomControlComponent.VIEW_ON_LOAD:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD);
			
        case haxapp.app.CustomControlComponent.VIEW_ON_RESIZE:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE);
			
        case haxapp.app.CustomControlComponent.VIEW_CONSTRUCTOR:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR); 


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
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
haxapp.app.CustomControlComponent.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	}  
    this.update(uiCodeFields);
}


haxapp.app.CustomControlComponent.prototype.createResource = function() {
    try {
        var resourceMethodsCode = "";
        var uiCodeFields = this.getUiCodeFields();
        
        for(var fieldName in haxapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS) {
            var fieldCode = uiCodeFields[fieldName];
            if((fieldCode)&&(fieldCode != "")) {
                
                var format = haxapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS[fieldName];
                var codeSnippet = hax.util.formatString(format,fieldCode);
                
                resourceMethodsCode += codeSnippet + "\n";
            }
        }
        
        //create the resource generator wrapped with its closure
        var generatorFunctionBody = hax.util.formatString(
            haxapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
            resourceMethodsCode
        );

        //create the function generator, with the aliased variables in the closure
        var generatorFunction = new Function(generatorFunctionBody);
        var resourceFunction = generatorFunction();

        var resource = resourceFunction();

        return resource;
    }
    catch(error) {
        alert("Error creating custom control: " + error.message);
    }
}

//=============================
// Action
//=============================

haxapp.app.CustomControlComponent.prototype.update = function(uiCodeFields) {   
    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(haxapp.app.CustomControlComponent.CODE_FIELD_CSS);
    
    //update the css right away
    
    if(newCss !== this.currentCss) {
        if(!((newCss == "")&&(this.currentCss == ""))) {
            haxapp.ui.setMemberCssData(this.getObject().getId(),newCss);
            this.currentCss = newCss;
        }
    }
    
	var actionResponse = new hax.ActionResponse();
    return actionResponse; 
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the table component. */
haxapp.app.CustomControlComponent.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
haxapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
"//member functions",
"var resourceFunction = function(component) {",
"var resource = {};",
"{0}",
"return resource;",
"}",
"//end member functions",
"return resourceFunction;",
""
   ].join("\n");
   
   
   
/** This is the format string to create the resource method code
 * @private
 */
haxapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS = {
    "constructorAddition":"resource.constructorAddition = function(mode) {\n{0}\n};",
    "init":"resource.init = function(element,mode) {\n{0}\n};",
    "setData":"resource.setData = function(data,element,mode) {\n{0}\n};",
    "onHide":"resource.onHide = function(element,mode) {\n{0}\n};",
    "destroy":"resource.destroy = function(element,mode) {\n{0}\n};",
    "onLoad":"resource.onLoad = function(element,mode) {\n{0}\n};",
    "onResize":"resource.onResize = function(element,mode) {\n{0}\n};"
}


//======================================
// Static methods
//======================================


/** This method creates the control. */
haxapp.app.CustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = hax.JsonTable.generator.type;
    var actionResponse = hax.action.doAction(json);
    
    var control = json.member;
    
    if(control) {
        
        if(!data.destroyOnHide) {
            //update the component options, but don't modify the options structure passed in.
            var activeComponentOptions;
            if(componentOptions) {
                activeComponentOptions = hax.util.deepJsonCopy(componentOptions);
            }
            else {
                activeComponentOptions = {};
            }
            activeComponentOptions.doKeepAlive = true;
        }
        
        //create the component
        var customControlComponent = new haxapp.app.CustomControlComponent.createComponentFromJson(workspaceUI,control,activeComponentOptions);
        actionResponse.component = customControlComponent;
    }
    return actionResponse;
}

haxapp.app.CustomControlComponent.createComponentFromJson = function(workspaceUI,control,componentJson) {
    var customControlComponent = new haxapp.app.CustomControlComponent(workspaceUI,control,componentJson);
    return customControlComponent;
}

haxapp.app.CustomControlComponent.addPropFunction = function(component,values) {
    var keepAlive = component.getDoKeepAlive();
    values.destroyOnHide = !keepAlive;
}

haxapp.app.CustomControlComponent.updateProperties = function(component,oldValues,newValues,actionResponse) {
    var doKeepAlive = (newValues.destroyOnHide) ? false : true;
    component.setDoKeepAlive(doKeepAlive);
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

haxapp.app.CustomControlComponent.generator.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];

haxapp.app.CustomControlComponent.generator.addPropFunction = haxapp.app.CustomControlComponent.addPropFunction;
haxapp.app.CustomControlComponent.generator.updateProperties = haxapp.app.CustomControlComponent.updateProperties;

