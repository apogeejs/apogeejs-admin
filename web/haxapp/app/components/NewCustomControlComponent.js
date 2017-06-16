/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
haxapp.app.NewCustomControlComponent = function(workspaceUI,control,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,control,haxapp.app.NewCustomControlComponent.generator,componentJson);
    
    this.uiCodeFields = {};
    this.currentCss = "";
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

haxapp.app.NewCustomControlComponent.prototype.getDataDisplay = function(viewMode) {
    var html = this.getUiCodeField(haxapp.app.NewCustomControlComponent.CODE_FIELD_HTML);
    var resource = this.createResource();
    var dataDisplay = new haxapp.app.CustomControlDataDisplay(html,resource,viewMode);
    return dataDisplay;
}

haxapp.app.NewCustomControlComponent.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

haxapp.app.NewCustomControlComponent.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.NewCustomControlComponent.CODE_FIELD_HTML = "html";
haxapp.app.NewCustomControlComponent.CODE_FIELD_CSS = "css";
haxapp.app.NewCustomControlComponent.CODE_FIELD_INIT = "init";
haxapp.app.NewCustomControlComponent.CODE_FIELD_SET_DATA = "setData";
haxapp.app.NewCustomControlComponent.CODE_FIELD_ON_SHOWN = "onShown";
haxapp.app.NewCustomControlComponent.CODE_FIELD_ON_HIDE = "onHide";
haxapp.app.NewCustomControlComponent.CODE_FIELD_DESTROY = "destroy";
haxapp.app.NewCustomControlComponent.CODE_FIELD_UI_SUPPLEMENTAL = "uiPrivate";

haxapp.app.NewCustomControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.NewCustomControlComponent.VIEW_CODE = "Model Code";
haxapp.app.NewCustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.NewCustomControlComponent.VIEW_HTML = "HTML";
haxapp.app.NewCustomControlComponent.VIEW_CSS = "CSS";
haxapp.app.NewCustomControlComponent.VIEW_INIT = "init(element,mode)";
haxapp.app.NewCustomControlComponent.VIEW_SET_DATA = "setData(data,element,mode)";
haxapp.app.NewCustomControlComponent.VIEW_ON_SHOWN = "onShown(element,mode)";
haxapp.app.NewCustomControlComponent.VIEW_ON_HIDE = "onHide(element,mode)";
haxapp.app.NewCustomControlComponent.VIEW_DESTROY = "destroy(element,mode)";
haxapp.app.NewCustomControlComponent.VIEW_UI_SUPPLEMENTAL = "UI Private";
haxapp.app.NewCustomControlComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.NewCustomControlComponent.VIEW_MODES = [
	haxapp.app.NewCustomControlComponent.VIEW_OUTPUT,
	haxapp.app.NewCustomControlComponent.VIEW_CODE,
    haxapp.app.NewCustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.NewCustomControlComponent.VIEW_HTML,
    haxapp.app.NewCustomControlComponent.VIEW_CSS,
    haxapp.app.NewCustomControlComponent.VIEW_INIT,
    haxapp.app.NewCustomControlComponent.VIEW_SET_DATA,
    haxapp.app.NewCustomControlComponent.VIEW_ON_SHOWN,
    haxapp.app.NewCustomControlComponent.VIEW_ON_HIDE,
    haxapp.app.NewCustomControlComponent.VIEW_DESTROY,
    haxapp.app.NewCustomControlComponent.VIEW_UI_SUPPLEMENTAL,
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
				this.outputMode = new haxapp.app.ControlOutputMode(editComponentDisplay);
			}
			return this.outputMode;
			
		case haxapp.app.NewCustomControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay);
			
		case haxapp.app.NewCustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
            
        
        case haxapp.app.NewCustomControlComponent.VIEW_HTML:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.NewCustomControlComponent.CODE_FIELD_HTML);
    
        case haxapp.app.NewCustomControlComponent.VIEW_CSS:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.NewCustomControlComponent.CODE_FIELD_CSS);
            
        case haxapp.app.NewCustomControlComponent.VIEW_INIT:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.NewCustomControlComponent.CODE_FIELD_INIT);
    
        case haxapp.app.NewCustomControlComponent.VIEW_SET_DATA:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.NewCustomControlComponent.CODE_FIELD_SET_DATA);
    
        case haxapp.app.NewCustomControlComponent.VIEW_ON_SHOWN:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.NewCustomControlComponent.CODE_FIELD_ON_SHOWN);
			  
        case haxapp.app.NewCustomControlComponent.VIEW_ON_HIDE:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.NewCustomControlComponent.CODE_FIELD_ON_HIDE);    
            
        case haxapp.app.NewCustomControlComponent.VIEW_DESTROY:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.NewCustomControlComponent.CODE_FIELD_DESTROY);    
            
        case haxapp.app.NewCustomControlComponent.VIEW_UI_SUPPLEMENTAL:
            return new haxapp.app.AceCustomControlMode(editComponentDisplay,haxapp.app.NewCustomControlComponent.CODE_FIELD_UI_SUPPLEMENTAL); 


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
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
haxapp.app.NewCustomControlComponent.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	}  
    this.update(uiCodeFields);
}


haxapp.app.NewCustomControlComponent.prototype.createResource = function() {
    try {
        var initCode = this.getUiCodeField(haxapp.app.NewCustomControlComponent.CODE_FIELD_INIT);
        var setDataCode = this.getUiCodeField(haxapp.app.NewCustomControlComponent.CODE_FIELD_SET_DATA);
        var onShownCode = this.getUiCodeField(haxapp.app.NewCustomControlComponent.CODE_FIELD_ON_SHOWN);
        var onHideCode = this.getUiCodeField(haxapp.app.NewCustomControlComponent.CODE_FIELD_ON_HIDE);
        var destroyCode = this.getUiCodeField(haxapp.app.NewCustomControlComponent.CODE_FIELD_DESTROY);
        var uiPrivateCode = this.getUiCodeField(haxapp.app.NewCustomControlComponent.CODE_FIELD_UI_SUPPLEMENTAL);
        
        //create the resource generator wrapped with its closure
        var generatorFunctionBody = hax.util.formatString(
            haxapp.app.NewCustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
            initCode,
            setDataCode,
            onShownCode,
            onHideCode,
            destroyCode,
            uiPrivateCode
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

haxapp.app.NewCustomControlComponent.prototype.update = function(uiCodeFields) {    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(haxapp.app.NewCustomControlComponent.CODE_FIELD_CSS);
    
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
haxapp.app.NewCustomControlComponent.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: init
 * 1: setData
 * 2: onShown
 * 3: onHide
 * 4: destroy
 * 5: uiPrivate
 * @private
 */
haxapp.app.NewCustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
"",
"//supplemental code",
"{5}",
"//end supplemental code",
"",
"//member function",
"var resourceFunction = function(component) {",
"var resource = {};",
"resource.init = function(element,mode) {",
"{0}",
"};",
"resource.setData = function(data,element,mode) {",
"{1}",
"};",
"resource.onShown = function(element,mode) {",
"{2}",
"};",
"resource.onHide = function(element,mode) {",
"{3}",
"};",
"resource.destroy = function(element,mode) {",
"{4}",
"};",
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

