/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
apogeeapp.app.CustomComponent = function(workspaceUI,control) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,control,apogeeapp.app.CustomComponent);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    
    //keep alive or destroy on inactive
    this.destroyOnInactive = false;
};

apogeeapp.app.CustomComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.CustomComponent.prototype.constructor = apogeeapp.app.CustomComponent;

//==============================
//Resource Accessors
//==============================

apogeeapp.app.CustomComponent.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

apogeeapp.app.CustomComponent.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

apogeeapp.app.CustomComponent.prototype.getDestroyOnInactive = function() {
    return this.destroyOnInactive;
}

apogeeapp.app.CustomComponent.prototype.getDisplayDestroyFlags = function() {
    return this.destroyOnInactive ? apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_INACTIVE :
            apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_NEVER;
}

apogeeapp.app.CustomComponent.prototype.setDestroyOnInactive = function(destroyOnInactive) {
    this.destroyOnInactive = destroyOnInactive;
    
    if(this.activeOutputMode) {
        this.activeOutputMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.CustomComponent.CODE_FIELD_HTML = "html";
apogeeapp.app.CustomComponent.CODE_FIELD_CSS = "css";
apogeeapp.app.CustomComponent.CODE_FIELD_UI_CODE = "uiCode";
apogeeapp.app.CustomComponent.VIEW_OUTPUT = "Display";
apogeeapp.app.CustomComponent.VIEW_CODE = "Input Code";
apogeeapp.app.CustomComponent.VIEW_SUPPLEMENTAL_CODE = "Input Private";
apogeeapp.app.CustomComponent.VIEW_HTML = "HTML";
apogeeapp.app.CustomComponent.VIEW_CSS = "CSS";
apogeeapp.app.CustomComponent.VIEW_UI_CODE = "uiGenerator()";
apogeeapp.app.CustomComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.CustomComponent.VIEW_MODES = [
    apogeeapp.app.CustomComponent.VIEW_OUTPUT,
    apogeeapp.app.CustomComponent.VIEW_CODE,
    apogeeapp.app.CustomComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.CustomComponent.VIEW_HTML,
    apogeeapp.app.CustomComponent.VIEW_CSS,
    apogeeapp.app.CustomComponent.VIEW_UI_CODE,
    apogeeapp.app.CustomComponent.VIEW_DESCRIPTION
];

apogeeapp.app.CustomComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.CustomComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.CustomComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.CustomComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.CustomComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.CustomComponent.prototype.getDataDisplay = function(displayContainer,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.CustomComponent.VIEW_OUTPUT:
            displayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            this.activeOutputMode = displayContainer;
            var callbacks = this.getOutputCallbacks();
            var html = this.getUiCodeField(apogeeapp.app.CustomComponent.CODE_FIELD_HTML);
            var resource = this.createResource();
            var dataDisplay = new apogeeapp.app.HtmlJsDataDisplay(displayContainer,callbacks,this.member,html,resource);
            return dataDisplay;
			
		case apogeeapp.app.CustomComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
			return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.CustomComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.CustomComponent.VIEW_HTML:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomComponent.CODE_FIELD_HTML);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/html");
    
        case apogeeapp.app.CustomComponent.VIEW_CSS:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomComponent.CODE_FIELD_CSS);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/css");
            
        case apogeeapp.app.CustomComponent.VIEW_UI_CODE:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomComponent.CODE_FIELD_UI_CODE);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");


        case apogeeapp.app.CustomComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(displayContainer,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

apogeeapp.app.CustomComponent.prototype.getOutputCallbacks = function(codeField) {
    return {
        getData: () => this.getMember().getData()
    };
}

apogeeapp.app.CustomComponent.prototype.getUiCallbacks = function(codeField) {
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
            var actionResponse = this.update(uiCodeFields);
            if(!actionResponse.getSuccess()) {
                //show an error message
                apogeeapp.app.errorHandling.handleActionError(actionResponse);
            }
            return true;  
        }
    }
}

/** This method deseriliazes data for the custom resource component. */
apogeeapp.app.CustomComponent.prototype.updateFromJson = function(json) {  
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.app.CustomComponent.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	}  
    this.update(uiCodeFields);
}


apogeeapp.app.CustomComponent.prototype.createResource = function() {
    try {
        var uiCodeFields = this.getUiCodeFields();

        var uiGeneratorBody = uiCodeFields[apogeeapp.app.CustomComponent.CODE_FIELD_UI_CODE];
        
        var resource;
        if((uiGeneratorBody)&&(uiGeneratorBody.length > 0)) {
            try {

                //create the resource generator wrapped with its closure
                var generatorFunctionBody = apogee.util.formatString(
                    apogeeapp.app.CustomComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
                    uiGeneratorBody
                );

                //create the function generator, with the aliased variables in the closure
                var generatorFunction = new Function(generatorFunctionBody);
                var resourceFunction = generatorFunction();
                
                resource = resourceFunction();
            }
            catch(err) {
                console.log("bad ui generator function");
            }
        }
            
        //create a dummy
        if(!resource) {
            resource = {};
        }

        return resource;
    }
    catch(error) {
        alert("Error creating custom control: " + error.message);
    }
}


//=============================
// Action
//=============================

apogeeapp.app.CustomComponent.prototype.update = function(uiCodeFields) { 
    
    //make sure we get rid of the old display
    if(this.activeOutputMode) {
        this.activeOutputMode.forceClearDisplay();
    }
    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(apogeeapp.app.CustomComponent.CODE_FIELD_CSS);
    
    //update the css right away
    
    if(newCss !== this.currentCss) {
        if(!((newCss == "")&&(this.currentCss == ""))) {
            apogeeapp.ui.setMemberCssData(this.getMember().getId(),newCss);
            this.currentCss = newCss;
        }
    }
    
	var actionResponse = new apogee.ActionResponse();
    return actionResponse; 
}

//==============================
// serialization
//==============================

apogeeapp.app.CustomComponent.prototype.readFromJson = function(json) {
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
apogeeapp.app.CustomComponent.prototype.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
    json.destroyOnInactive = this.destroyOnInactive;
}

//======================================
// properties
//======================================

apogeeapp.app.CustomComponent.prototype.addPropFunction = function(values) {
    values.destroyOnHide = this.getDestroyOnInactive();
}

apogeeapp.app.CustomComponent.prototype.updateProperties = function(oldValues,newValues) {
    this.setDestroyOnInactive(newValues.destroyOnHide);
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
apogeeapp.app.CustomComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
"//member functions",
"var resourceFunction = function(component) {",
"{0}",
"}",
"//end member functions",
"return resourceFunction;",
""
   ].join("\n");



//======================================
// Static methods
//======================================

apogeeapp.app.CustomComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
    return json;
}

apogeeapp.app.CustomComponent.mergePropertiesToSourceJson = function(userInputValues,sourceJson) {
    if(userInputValues.destroyOnInactive !== undefined) {
        json.destroyOnInactive = userInputValues.destroyOnInactive;
    }
}

//======================================
// This is the control generator, to register the control
//======================================

apogeeapp.app.CustomComponent.displayName = "Custom Component";
apogeeapp.app.CustomComponent.uniqueName = "apogeeapp.app.CustomComponent";
apogeeapp.app.CustomComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.CustomComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.CustomComponent.ICON_RES_PATH = "/componentIcons/chartControl.png";

apogeeapp.app.CustomComponent.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];



