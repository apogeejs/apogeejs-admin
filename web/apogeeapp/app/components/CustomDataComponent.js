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
    
    this.fieldUpdated("destroyOnInactive");
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
    if(destroyOnInactive != this.destroyOnInactive) {
        this.fieldUpdated("destroyOnInactive");
        this.destroyOnInactive = destroyOnInactive;

        if(this.activeOutputDisplayContainer) {
            this.activeOutputDisplayContainer.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
        }
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
        
        saveData: (text) => this.doCodeFieldUpdate(codeField,text)
    }
}

/** This method deseriliazes data for the custom resource component. */
apogeeapp.app.CustomDataComponent.prototype.updateFromJson = function(json) {  
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.app.CustomDataComponent.prototype.loadResourceFromJson = function(json) {   
    if((json)&&(json.resource)) {
        this.update(json.resource);
	} 
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
                if(err.stack) console.error(err.stack);
                
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
        if(error.stack) console.error(error.stack);
        
        alert("Error creating custom control: " + error.message);
    }
}

//=============================
// Action
//=============================

apogeeapp.app.CustomDataComponent.prototype.doCodeFieldUpdate = function(uiCodeField,fieldValue) { 

    var initialCodeFields = this.getUiCodeFields();
    var targetCodeFields = apogee.util.jsonCopy(initialCodeFields);
    targetCodeFields[uiCodeField] = fieldValue;

    var command = {};
    command.cmd = () => this.update(targetCodeFields);
    command.undoCmd = () => this.update(initialCodeFields);
    command.desc = "Update code field " + uiCodeField + " - " + this.getMember().getFullName();
    command.setDirty = true;

    apogeeapp.app.Apogee.getInstance().executeCommand(command);
    return true;  
}

apogeeapp.app.CustomDataComponent.prototype.update = function(uiCodeFields) { 
    
    //make sure we get rid of the old display
    if(this.activeOutputDisplayContainer) {
        this.activeOutputDisplayContainer.forceClearDisplay();
        this.activeOutputDisplayContainer.memberUpdated();
    }

    //record the updates
    if(uiCodeFields[apogeeapp.app.CustomComponent.CODE_FIELD_CSS] != this.uiCodeFields[apogeeapp.app.CustomComponent.CODE_FIELD_CSS]) {
        this.fieldUpdated(apogeeapp.app.CustomComponent.CODE_FIELD_CSS);
        
        //update css now
        let cssInfo = uiCodeFields[apogeeapp.app.CustomComponent.CODE_FIELD_CSS];
        apogeeapp.ui.setMemberCssData(this.getMember().getId(),cssInfo);
    }
    if(uiCodeFields[apogeeapp.app.CustomComponent.CODE_FIELD_HTML] != this.uiCodeFields[apogeeapp.app.CustomComponent.CODE_FIELD_HTML]) {
        this.fieldUpdated(apogeeapp.app.CustomComponent.CODE_FIELD_HTML);
    }
    if(uiCodeFields[apogeeapp.app.CustomComponent.CODE_FIELD_UI_CODE] != this.uiCodeFields[apogeeapp.app.CustomComponent.CODE_FIELD_UI_CODE]) {
        this.fieldUpdated(apogeeapp.app.CustomComponent.CODE_FIELD_UI_CODE);
    }
    
    this.uiCodeFields = uiCodeFields;
    
    return true;
}

//==============================
// serialization
//==============================

apogeeapp.app.CustomDataComponent.prototype.readFromJson = function(json) {
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
apogeeapp.app.CustomDataComponent.prototype.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
    json.destroyOnInactive = this.destroyOnInactive;
}

//======================================
// properties
//======================================

apogeeapp.app.CustomDataComponent.prototype.readExtendedProperties = function(values) {
    values.destroyOnInactive = this.getDestroyOnInactive();
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

apogeeapp.app.CustomDataComponent.createMemberJson = function(userInputValues,optionalBaseJson) {
    var json = apogeeapp.app.Component.createMemberJson(apogeeapp.app.CustomDataComponent,userInputValues,optionalBaseJson);
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
apogeeapp.app.CustomDataComponent.DEFAULT_MEMBER_JSON = {
        "type": apogee.Folder.generator.type,
        "childrenNotWriteable": true,
        "children": {
            "input": {
                "name": "input",
                "type": "apogee.JsonTable",
                "updateData": {
                    "data":"",
                }
            },
            "data": {
                "name": "data",
                "type": "apogee.JsonTable",
                "updateData": {
                    "data": "",
                }
            }
        }
    };
apogeeapp.app.CustomDataComponent.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnInactive"
    }
];
apogeeapp.app.CustomDataComponent.transferComponentProperties = function(inputValues,propertyJson) {
    if(inputValues.destroyOnInactive !== undefined) {
        propertyJson.destroyOnInactive = inputValues.destroyOnInactive;
    }
}



