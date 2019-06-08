/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
apogeeapp.app.CustomControlComponent = function(workspaceUI,control) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,control,apogeeapp.app.CustomControlComponent);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    
    //keep alive or destroy on inactive
    this.destroyOnInactive = false;
};

apogeeapp.app.CustomControlComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.CustomControlComponent.prototype.constructor = apogeeapp.app.CustomControlComponent;

//==============================
//Resource Accessors
//==============================

apogeeapp.app.CustomControlComponent.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

apogeeapp.app.CustomControlComponent.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

apogeeapp.app.CustomControlComponent.prototype.getDestroyOnInactive = function() {
    return this.destroyOnInactive;
}

apogeeapp.app.CustomControlComponent.prototype.getDisplayDestroyFlags = function() {
    return this.destroyOnInactive ? apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_INACTIVE :
            apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_NEVER;
}

apogeeapp.app.CustomControlComponent.prototype.setDestroyOnInactive = function(destroyOnInactive) {
    this.destroyOnInactive = destroyOnInactive;
    
    if(this.activeOutputDisplayContainer) {
        this.activeOutputDisplayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML = "html";
apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS = "css";
apogeeapp.app.CustomControlComponent.CODE_FIELD_INIT = "init";
apogeeapp.app.CustomControlComponent.CODE_FIELD_SET_DATA = "setData";
apogeeapp.app.CustomControlComponent.CODE_FIELD_IS_CLOSE_OK = "isCloseOk";
apogeeapp.app.CustomControlComponent.CODE_FIELD_DESTROY = "destroy";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD = "onLoad";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_UNLOAD = "onUnload";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE = "onResize";
apogeeapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR = "constructorAddition";

apogeeapp.app.CustomControlComponent.VIEW_OUTPUT = "Output";
apogeeapp.app.CustomControlComponent.VIEW_CODE = "Model Code";
apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.CustomControlComponent.VIEW_HTML = "HTML";
apogeeapp.app.CustomControlComponent.VIEW_CSS = "CSS";
apogeeapp.app.CustomControlComponent.VIEW_INIT = "init(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_SET_DATA = "setData(data,element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_IS_CLOSE_OK = "isCloseOk(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_DESTROY = "destroy(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD = "onLoad(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_UNLOAD = "onUnload(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE = "onResize(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR = "constructor(mode)";
apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.CustomControlComponent.VIEW_MODES = [
	apogeeapp.app.CustomControlComponent.VIEW_OUTPUT,
	apogeeapp.app.CustomControlComponent.VIEW_CODE,
    apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.CustomControlComponent.VIEW_HTML,
    apogeeapp.app.CustomControlComponent.VIEW_CSS,
    apogeeapp.app.CustomControlComponent.VIEW_INIT,
    apogeeapp.app.CustomControlComponent.VIEW_SET_DATA,
    apogeeapp.app.CustomControlComponent.VIEW_IS_CLOSE_OK,
    apogeeapp.app.CustomControlComponent.VIEW_DESTROY,
    apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD,
    apogeeapp.app.CustomControlComponent.VIEW_ON_UNLOAD,
    apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE,
    apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR,
    apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION
];

apogeeapp.app.CustomControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.CustomControlComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.CustomControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.CustomControlComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.CustomControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.CustomControlComponent.prototype.getDataDisplay = function(displayContainer,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.CustomControlComponent.VIEW_OUTPUT:
            displayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            this.activeOutputDisplayContainer = displayContainer;
            var callbacks = this.getCustomFormCallbacks();
            var html = this.getUiCodeField(apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
            var resource = this.createResource();
            var dataDisplay = new apogeeapp.app.HtmlJsDataDisplay(displayContainer,callbacks,this.member,html,resource);
            return dataDisplay;
			
		case apogeeapp.app.CustomControlComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
			return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.CustomControlComponent.VIEW_HTML:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/html");
    
        case apogeeapp.app.CustomControlComponent.VIEW_CSS:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/css");
            
        case apogeeapp.app.CustomControlComponent.VIEW_INIT:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_INIT);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_SET_DATA:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_SET_DATA);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_IS_CLOSE_OK:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_IS_CLOSE_OK);    
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_DESTROY:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_DESTROY);    
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_ON_UNLOAD:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_UNLOAD);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE);
			return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR); 
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");

        case apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(displayContainer,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

apogeeapp.app.CustomControlComponent.prototype.getCustomFormCallbacks = function(codeField) {
    return {
        getData: () => this.getMember().getData()
    };
}

apogeeapp.app.CustomControlComponent.prototype.getUiCallbacks = function(codeField) {
    return {
        getData: () => {
            var uiCodeFields = this.getUiCodeFields();
            var data = uiCodeFields[codeField];
            if((data === undefined)||(data === null)) data = "";
            return data;
        },
        
        getEditOk: () => true,
        
        saveData: (text) => {
            var uiCodeFields = this.getUiCodeFields();
            uiCodeFields[codeField] = text;
            this.update(uiCodeFields);
            return true;  
        }
    }
}

/** This method deseriliazes data for the custom resource component. */
apogeeapp.app.CustomControlComponent.prototype.updateFromJson = function(json) {  
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.app.CustomControlComponent.prototype.loadResourceFromJson = function(json) {   
    if((json)&&(json.resource)) {
        this.update(json.resource);
	} 
}


apogeeapp.app.CustomControlComponent.prototype.createResource = function() {
    try {
        var resourceMethodsCode = "";
        var uiCodeFields = this.getUiCodeFields();
        
        for(var fieldName in apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS) {
            var fieldCode = uiCodeFields[fieldName];
            if((fieldCode)&&(fieldCode != "")) {
                
                var format = apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS[fieldName];
                var codeSnippet = apogee.util.formatString(format,fieldCode);
                
                resourceMethodsCode += codeSnippet + "\n";
            }
        }
        
        //create the resource generator wrapped with its closure
        var generatorFunctionBody = apogee.util.formatString(
            apogeeapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
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

apogeeapp.app.CustomControlComponent.prototype.update = function(uiCodeFields) { 
    
    //make sure we get rid of the old display
    if(this.activeOutputDisplayContainer) {
        this.activeOutputDisplayContainer.forceClearDisplay();
    }
    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS);
    
    //update the css right away
    
    if(newCss !== this.currentCss) {
        if(!((newCss == "")&&(this.currentCss == ""))) {
            apogeeapp.ui.setMemberCssData(this.getMember().getId(),newCss);
            this.currentCss = newCss;
        }
    }
}

//==============================
// serialization
//==============================

apogeeapp.app.CustomControlComponent.prototype.readFromJson = function(json) {
    if(!json) return;
    
    //set destroy flag
    if(json.destroyOnInactive !== undefined) {
        var destroyOnInactive = json.destroyOnInactive;
        this.setDestroyOnInactive(destroyOnInactive);
    }
    
    //load the resource
    this.loadResourceFromJson(json);
}

/** This serializes the table component. */
apogeeapp.app.CustomControlComponent.prototype.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
    json.destroyOnInactive = this.destroyOnInactive;
}

//=================================
// Properties
//=================================

apogeeapp.app.CustomControlComponent.prototype.readExtendedProperties = function(values) {
    values.destroyOnHide = this.getDestroyOnInactive();
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
apogeeapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
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
apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS = {
    "constructorAddition":"resource.constructorAddition = function(mode) {\n__customControlDebugHook();\n{0}\n};",
    "init":"resource.init = function(element,mode) {\n{0}\n};",
    "setData":"resource.setData = function(data,element,mode) {\n{0}\n};",
    "isCloseOk":"resource.isCloseOk = function(element,mode) {\n{0}\n};",
    "destroy":"resource.destroy = function(element,mode) {\n{0}\n};",
    "onLoad":"resource.onLoad = function(element,mode) {\n{0}\n};",
    "onUnload":"resource.onUnload = function(element,mode) {\n{0}\n};",
    "onResize":"resource.onResize = function(element,mode) {\n{0}\n};"
}


//======================================
// Static methods
//======================================

apogeeapp.app.CustomControlComponent.createMemberJson = function(userInputValues,optionalBaseJson) {
    var json = apogeeapp.app.Component.createMemberJson(apogeeapp.app.CustomControlComponent,userInputValues,optionalBaseJson);
    return json;
}

//======================================
// This is the control generator, to register the control
//======================================

apogeeapp.app.CustomControlComponent.displayName = "Custom Control Component (Deprecated)";
apogeeapp.app.CustomControlComponent.uniqueName = "apogeeapp.app.CustomControlComponent";
apogeeapp.app.CustomControlComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.CustomControlComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.CustomControlComponent.ICON_RES_PATH = "/componentIcons/chartControl.png";
apogeeapp.app.CustomControlComponent.DEFAULT_MEMBER_JSON = {
    "type": apogee.JsonTable.generator.type
};
apogeeapp.app.CustomControlComponent.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];



