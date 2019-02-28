/** This attempt has a single form edit page which returns an object. */
// To add - I should make it so it does not call set data until after it is initialized. I will cache it rather 
//than making the user do that.

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
apogeeapp.app.CustomDataComponent = function(workspaceUI,folder) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,folder,apogeeapp.app.CustomDataComponent);
    
    //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
    folder.setChildrenWriteable(false);
    
    //load these!
    this.dataTable = folder.lookupChildFromPathArray(["data"]);
    this.inputTable = folder.lookupChildFromPathArray(["input"]);
    this.isInputValidFunctionTable = folder.lookupChildFromPathArray(["isInputValid"]);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    
    //keep alive or destroy on inactive
    this.destroyOnInactive = false;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.CustomDataComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.CustomDataComponent.writeToJson);
};

apogeeapp.app.CustomDataComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.CustomDataComponent.prototype.constructor = apogeeapp.app.CustomDataComponent;

//==============================
//Resource Accessors
//==============================

apogeeapp.app.CustomDataComponent.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

apogeeapp.app.CustomDataComponent.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

apogeeapp.app.CustomDataComponent.prototype.getDestroyOnInactive = function() {
    return this.destroyOnInactive;
}

apogeeapp.app.CustomDataComponent.prototype.getDisplayDestroyFlags = function() {
    return this.destroyOnInactive ? apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_INACTIVE :
            apogeeapp.app.DisplayContainer.DISPLAY_DESTROY_FLAG_NEVER;
}

apogeeapp.app.CustomDataComponent.prototype.setDestroyOnInactive = function(destroyOnInactive) {
    this.destroyOnInactive = destroyOnInactive;
    
    if(this.activeOutputDisplayContainer) {
        this.activeOutputDisplayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.CustomDataComponent.CODE_FIELD_HTML = "html";
apogeeapp.app.CustomDataComponent.CODE_FIELD_CSS = "css";
apogeeapp.app.CustomDataComponent.CODE_FIELD_UI_CODE = "uiCode";
apogeeapp.app.CustomDataComponent.VIEW_FORM = "Form";
apogeeapp.app.CustomDataComponent.VIEW_VALUE = "Data Value";
apogeeapp.app.CustomDataComponent.VIEW_CODE = "Input Code";
apogeeapp.app.CustomDataComponent.VIEW_SUPPLEMENTAL_CODE = "Input Private";
apogeeapp.app.CustomDataComponent.VIEW_HTML = "HTML";
apogeeapp.app.CustomDataComponent.VIEW_CSS = "CSS";
apogeeapp.app.CustomDataComponent.VIEW_UI_CODE = "uiGenerator(mode)";
apogeeapp.app.CustomDataComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.CustomDataComponent.VIEW_MODES = [
    apogeeapp.app.CustomDataComponent.VIEW_FORM,
    apogeeapp.app.CustomDataComponent.VIEW_VALUE,
    apogeeapp.app.CustomDataComponent.VIEW_CODE,
    apogeeapp.app.CustomDataComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.CustomDataComponent.VIEW_HTML,
    apogeeapp.app.CustomDataComponent.VIEW_CSS,
    apogeeapp.app.CustomDataComponent.VIEW_UI_CODE,
    apogeeapp.app.CustomDataComponent.VIEW_DESCRIPTION
];

apogeeapp.app.CustomDataComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.CustomDataComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.CustomDataComponent.VIEW_FORM
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.CustomDataComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.CustomDataComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.CustomDataComponent.prototype.getDataDisplay = function(displayContainer,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.CustomDataComponent.VIEW_FORM:
            displayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            this.activeOutputDisplayContainer = displayContainer;
            var callbacks = this.getFormCallbacks();
            var html = this.getUiCodeField(apogeeapp.app.CustomDataComponent.CODE_FIELD_HTML);
            var resource = this.createResource();
            var dataDisplay = new apogeeapp.app.HtmlJsDataDisplay(displayContainer,callbacks,this.inputTable,html,resource);
            return dataDisplay;
            
        case apogeeapp.app.CustomDataComponent.VIEW_VALUE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.dataTable);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/json");
			
		case apogeeapp.app.CustomDataComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.inputTable);
			return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.CustomDataComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.inputTable);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.CustomDataComponent.VIEW_HTML:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomDataComponent.CODE_FIELD_HTML);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/html");
    
        case apogeeapp.app.CustomDataComponent.VIEW_CSS:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomDataComponent.CODE_FIELD_CSS);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/css");
            
        case apogeeapp.app.CustomDataComponent.VIEW_UI_CODE:
            callbacks = this.getUiCallbacks(apogeeapp.app.CustomDataComponent.CODE_FIELD_UI_CODE);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");

        case apogeeapp.app.CustomDataComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.inputTable);
            //return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(displayContainer,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

apogeeapp.app.CustomDataComponent.prototype.getFormCallbacks = function() {
    var callbacks = {};
    
    //return desired form value
    callbacks.getData = () => this.getMember().getData();
    
    //edit ok - always true
    callbacks.getEditOk = () => true;
    
    //save data - just form value here
    var messenger = new apogee.action.Messenger(this.inputTable);
    callbacks.saveData = (formValue) => {
        messenger.dataUpdate("data",formValue);
        return true;
    }
    
    return callbacks;
}


apogeeapp.app.CustomDataComponent.prototype.getUiCallbacks = function(codeField) {
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
apogeeapp.app.CustomDataComponent.prototype.updateFromJson = function(json) {  
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.app.CustomDataComponent.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	}  
    this.update(uiCodeFields);
}


apogeeapp.app.CustomDataComponent.prototype.createResource = function() {
    try {
        var uiCodeFields = this.getUiCodeFields();

        var uiGeneratorBody = uiCodeFields[apogeeapp.app.CustomDataComponent.CODE_FIELD_UI_CODE];
        
        var resource;
        if((uiGeneratorBody)&&(uiGeneratorBody.length > 0)) {
            try {

                //create the resource generator wrapped with its closure
                var generatorFunctionBody = apogee.util.formatString(
                    apogeeapp.app.CustomDataComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
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

apogeeapp.app.CustomDataComponent.prototype.update = function(uiCodeFields) { 
    
    //make sure we get rid of the old display
    if(this.activeOutputDisplayContainer) {
        this.activeOutputDisplayContainer.forceClearDisplay();
    }
    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(apogeeapp.app.CustomDataComponent.CODE_FIELD_CSS);
    
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

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

apogeeapp.app.CustomDataComponent.readFromJson = function(json) {
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
apogeeapp.app.CustomDataComponent.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
    json.destroyOnInactive = this.destroyOnInactive;
}

apogeeapp.app.CustomDataComponent.addPropFunction = function(component,values) {
    values.destroyOnHide = component.getDestroyOnInactive();
}

apogeeapp.app.CustomDataComponent.updateProperties = function(component,oldValues,newValues) {
    component.setDestroyOnInactive(newValues.destroyOnHide);
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
apogeeapp.app.CustomDataComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
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

apogeeapp.app.CustomDataComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.Folder.generator.type;
    json.childrenNotWriteable = true;
    //add the children
    json.children = {
        "input": {
            "name": "input",
            "type": "apogee.JsonTable",
            "updateData": {
                "data": "",
            }
        },
        "data": {
            "name": "data",
            "type": "apogee.JsonTable",
            "updateData": {
                "data": "",
            }
        }
    };
    return json;
}

//======================================
// This is the control generator, to register the control
//======================================

apogeeapp.app.CustomDataComponent.displayName = "Custom Data Component";
apogeeapp.app.CustomDataComponent.uniqueName = "apogeeapp.app.CustomDataComponent";
apogeeapp.app.CustomDataComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.CustomDataComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.CustomDataComponent.ICON_RES_PATH = "/componentIcons/formControl.png";

apogeeapp.app.CustomDataComponent.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];



