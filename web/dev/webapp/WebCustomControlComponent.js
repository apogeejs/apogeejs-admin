/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
apogeeapp.webapp.WebCustomControlComponent = function(control,componentJson) {
 
    this.control = control;
    this.uiCodeFields = {};
    this.css = "";
    this.loadResourceFromJson(componentJson);
    
    //create a resource based on the json (or lack of a json)
    if((componentJson)&&(componentJson.doKeepAlive)) {
        this.doKeepAlive = true;
    }
    else {
        this.doKeepAlive = false;
    }
    
};

apogeeapp.webapp.WebCustomControlComponent.prototype.initializeElement = function(containerElement) {
    this.containerElement = containerElement;
}

apogeeapp.webapp.WebCustomControlComponent.prototype.createWindowDisplay = function() {
    if(this.windowDisplay == null) {
        this.windowDisplay = new apogeeapp.webapp.ComponentDisplay(this.control,this);
    }
    return this.windowDisplay;
}



//==============================
//Resource Accessors
//==============================

apogeeapp.webapp.WebCustomControlComponent.prototype.getDataDisplay = function(viewMode) {
    var html = this.getUiCodeField(apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
    var resource = this.createResource();
    var dataDisplay = new apogeeapp.app.HtmlJsDataDisplay(html,resource,viewMode);
    return dataDisplay;
}

apogeeapp.webapp.WebCustomControlComponent.prototype.getDoKeepAlive = function() {
    return this.doKeepAlive;
}

apogeeapp.webapp.WebCustomControlComponent.prototype.setDoKeepAlive = function(doKeepAlive) {
    this.doKeepAlive = doKeepAlive;
    
    if(this.outputMode) {
        this.outputMode.setDoKeepAlive(doKeepAlive);
    }
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.webapp.WebCustomControlComponent.prototype.getViewModeElement = function(componentDisplay) {	
    if(!this.outputMode) {
        this.outputMode = new apogeeapp.app.ControlOutputMode(componentDisplay,this.doKeepAlive);
    }
    return this.outputMode;			
}

apogeeapp.webapp.WebCustomControlComponent.prototype.createResource = function() {
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

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.webapp.WebCustomControlComponent.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	} 
    this.uiCodeFields = uiCodeFields;
    
    //handle css
    this.css = uiCodeFields(apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS);
    if((this.css)&&(this.css != "")) {
        apogeeapp.ui.setMemberCssData(this.control.getId(),css);
    }
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
apogeeapp.webapp.WebCustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
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
apogeeapp.webapp.WebCustomControlComponent.GENERATOR_INTERNAL_FORMATS = {
    "constructorAddition":"resource.constructorAddition = function(mode) {\n{0}\n};",
    "init":"resource.init = function(element,mode) {\n{0}\n};",
    "setData":"resource.setData = function(data,element,mode) {\n{0}\n};",
    "onHide":"resource.onHide = function(element,mode) {\n{0}\n};",
    "destroy":"resource.destroy = function(element,mode) {\n{0}\n};",
    "onLoad":"resource.onLoad = function(element,mode) {\n{0}\n};",
    "onResize":"resource.onResize = function(element,mode) {\n{0}\n};"
}

