/** This attempt has a single form edit page which returns an object. */
// To add - I should make it so it does not call set data until after it is initialized. I will cache it rather 
//than making the user do that.

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
apogeeapp.app.CustomDataComponent3 = function(workspaceUI,folder) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,folder,apogeeapp.app.CustomDataComponent3);
    
    //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
    folder.setChildrenWriteable(false);
    
    //load these!
    this.dataTable = folder.lookupChildFromPathArray(["data"]);
    this.inputTable = folder.lookupChildFromPathArray(["control"]);
    this.isInputValidFunctionTable = folder.lookupChildFromPathArray(["isInputValid"]);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    
    //keep alive or destroy on inactive
    this.destroyOnInactive = false;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.CustomDataComponent3.readFromJson);
    this.addSaveAction(apogeeapp.app.CustomDataComponent3.writeToJson);
};

apogeeapp.app.CustomDataComponent3.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.CustomDataComponent3.prototype.constructor = apogeeapp.app.CustomDataComponent3;

//==============================
//Resource Accessors
//==============================

apogeeapp.app.CustomDataComponent3.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

apogeeapp.app.CustomDataComponent3.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

apogeeapp.app.CustomDataComponent3.prototype.getDestroyOnInactive = function() {
    return this.destroyOnInactive;
}

apogeeapp.app.CustomDataComponent3.prototype.getDisplayDestroyFlags = function() {
    return this.destroyOnInactive ? apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE :
            apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
}

apogeeapp.app.CustomDataComponent3.prototype.setDestroyOnInactive = function(destroyOnInactive) {
    this.destroyOnInactive = destroyOnInactive;
    
    if(this.activeOutputMode) {
        this.activeOutputMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.CustomDataComponent3.CODE_FIELD_HTML = "html";
apogeeapp.app.CustomDataComponent3.CODE_FIELD_CSS = "css";
apogeeapp.app.CustomDataComponent3.CODE_FIELD_UI_CODE = "uiCode";

apogeeapp.app.CustomDataComponent3.VIEW_FORM = "Form";
apogeeapp.app.CustomDataComponent3.VIEW_VALUE = "Data Value";
apogeeapp.app.CustomDataComponent3.VIEW_CODE = "Input Code";
apogeeapp.app.CustomDataComponent3.VIEW_SUPPLEMENTAL_CODE = "Input Private";
apogeeapp.app.CustomDataComponent3.VIEW_HTML = "HTML";
apogeeapp.app.CustomDataComponent3.VIEW_CSS = "CSS";
apogeeapp.app.CustomDataComponent3.VIEW_UI_CODE = "uiGenerator(mode)";
apogeeapp.app.CustomDataComponent3.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.CustomDataComponent3.VIEW_MODES = [
	apogeeapp.app.CustomDataComponent3.VIEW_FORM,
    apogeeapp.app.CustomDataComponent3.VIEW_VALUE,
	apogeeapp.app.CustomDataComponent3.VIEW_CODE,
    apogeeapp.app.CustomDataComponent3.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.CustomDataComponent3.VIEW_HTML,
    apogeeapp.app.CustomDataComponent3.VIEW_CSS,
    apogeeapp.app.CustomDataComponent3.VIEW_UI_CODE,
    apogeeapp.app.CustomDataComponent3.VIEW_DESCRIPTION
];

apogeeapp.app.CustomDataComponent3.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.CustomDataComponent3.VIEW_MODES,
    "defaultView": apogeeapp.app.CustomDataComponent3.VIEW_FORM
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.CustomDataComponent3.prototype.getTableEditSettings = function() {
    return apogeeapp.app.CustomDataComponent3.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.CustomDataComponent3.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.CustomDataComponent3.VIEW_FORM:
            viewMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            this.activeOutputMode = viewMode;
            var callbacks = this.getFormEditorCallbacks();
            var html = this.getUiCodeField(apogeeapp.app.CustomDataComponent3.CODE_FIELD_HTML);
            var resource = this.createResource();
            var dataDisplay = new apogeeapp.app.HtmlJsDataEditor3(viewMode,callbacks,this.inputTable,html,resource);
            return dataDisplay;
            
        case apogeeapp.app.CustomDataComponent3.VIEW_VALUE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.dataTable);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
			
		case apogeeapp.app.CustomDataComponent3.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.inputTable);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.CustomDataComponent3.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.inputTable);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.CustomDataComponent3.VIEW_HTML:
            callbacks = this.getCallbacks(apogeeapp.app.CustomDataComponent3.CODE_FIELD_HTML);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/html");
    
        case apogeeapp.app.CustomDataComponent3.VIEW_CSS:
            callbacks = this.getCallbacks(apogeeapp.app.CustomDataComponent3.CODE_FIELD_CSS);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/css");
            
        case apogeeapp.app.CustomDataComponent3.VIEW_UI_CODE:
            callbacks = this.getCallbacks(apogeeapp.app.CustomDataComponent3.CODE_FIELD_UI_CODE);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");

        case apogeeapp.app.CustomDataComponent3.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.inputTable);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}


apogeeapp.app.CustomDataComponent3.prototype.getFormEditorCallbacks = function() {
    var callbacks = {};
    
    //return desired form value
    callbacks.getData = () => {
        var data = {};
        data.inputData = this.inputTable.getData();
        data.editData = this.dataTable.getData();
        return data;
    }
    
    //edit ok - always true
    callbacks.getEditOk = () => true;
    
    //save data - just form value here
    var messenger = new apogee.action.Messenger(this.inputTable);
    callbacks.saveData = (formValue) => {
        
        //validate input
//        var isInputValid = this.isInputValidFunctionTable.getData();
//        var validateResult = isInputValid(formValue);
//        if(validateResult !== true) {
//            if(typeof validateResult == 'string') {
//                alert(validateResult);
//                return false;
//            }
//            else {
//                alert("Improper format for isInputValid function. It should return true or an error message");
//                return;
//            }
//        }

        //save the data
        messenger.dataUpdate("data",formValue);
        return true;
    }
    
    return callbacks;
}


apogeeapp.app.CustomDataComponent3.prototype.getCallbacks = function(codeField) {
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
apogeeapp.app.CustomDataComponent3.prototype.updateFromJson = function(json) {  
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.app.CustomDataComponent3.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	}  
    this.update(uiCodeFields);
}


apogeeapp.app.CustomDataComponent3.prototype.createResource = function() {
    try {
        var uiCodeFields = this.getUiCodeFields();

        var uiGeneratorBody = uiCodeFields[apogeeapp.app.CustomDataComponent3.CODE_FIELD_UI_CODE];
        
        var resource;
        if((uiGeneratorBody)&&(uiGeneratorBody.length > 0)) {
            try {

                //create the resource generator wrapped with its closure
                var generatorFunctionBody = apogee.util.formatString(
                    apogeeapp.app.CustomDataComponent3.GENERATOR_FUNCTION_FORMAT_TEXT,
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

apogeeapp.app.CustomDataComponent3.prototype.update = function(uiCodeFields) { 
    
    //make sure we get rid of the old display
    if(this.activeOutputMode) {
        this.activeOutputMode.forceClearDisplay();
    }
    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(apogeeapp.app.CustomDataComponent3.CODE_FIELD_CSS);
    
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

apogeeapp.app.CustomDataComponent3.readFromJson = function(json) {
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
apogeeapp.app.CustomDataComponent3.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
    json.destroyOnInactive = this.destroyOnInactive;
}

apogeeapp.app.CustomDataComponent3.addPropFunction = function(component,values) {
    values.destroyOnHide = component.getDestroyOnInactive();
}

apogeeapp.app.CustomDataComponent3.updateProperties = function(component,oldValues,newValues) {
    component.setDestroyOnInactive(newValues.destroyOnHide);
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
apogeeapp.app.CustomDataComponent3.GENERATOR_FUNCTION_FORMAT_TEXT = [
"//member functions",
"var resourceFunction = function(component) {",
"{0}",
"}",
"//end member functions",
"return resourceFunction;",
""
   ].join("\n");
   
   
   
/** This is the format string to create the resource method code
 * @private
 */
apogeeapp.app.CustomDataComponent3.GENERATOR_INTERNAL_FORMATS = {
    "constructorAddition":"resource.constructorAddition = function(mode) {\n__customControlDebugHook();\n{0}\n};",
    "init":"resource.init = function(element,mode) {\n{0}\n};",
    "setData":"resource.setData = function(baseData,formData,element,mode) {\n{0}\n};",
    "getData":"resource.getData = function(element,mode) {\n{0}\n};",
    "isCloseOk":"resource.isCloseOk = function(element,mode) {\n{0}\n};",
    "destroy":"resource.destroy = function(element,mode) {\n{0}\n};",
    "onLoad":"resource.onLoad = function(element,mode) {\n{0}\n};",
    "onUnload":"resource.onUnload = function(element,mode) {\n{0}\n};",
    "onResize":"resource.onResize = function(element,mode) {\n{0}\n};"
}


//======================================
// Static methods
//======================================

apogeeapp.app.CustomDataComponent3.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.Folder.generator.type;
    json.childrenNotWriteable = true;
    //add the children
    json.children = {
        "control": {
            "name": "control",
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
        },
        "isInputValid": {
            "name": "isInputValid",
            "type": "apogee.FunctionTable",
            "updateData": {
                "argList":["formValue"],
                "functionBody": "//If data valid, return true. If data is invalid, return an error message.\nreturn true;"
            }
        }
    };
    return json;
}

//======================================
// This is the control generator, to register the control
//======================================

apogeeapp.app.CustomDataComponent3.displayName = "Custom Data Component3";
apogeeapp.app.CustomDataComponent3.uniqueName = "apogeeapp.app.CustomDataComponent3";
apogeeapp.app.CustomDataComponent3.DEFAULT_WIDTH = 500;
apogeeapp.app.CustomDataComponent3.DEFAULT_HEIGHT = 500;
apogeeapp.app.CustomDataComponent3.ICON_RES_PATH = "/componentIcons/formControl.png";

apogeeapp.app.CustomDataComponent3.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];



