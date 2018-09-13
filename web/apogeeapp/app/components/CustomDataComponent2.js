/** This attempt runs thhe UI code in the model - which is simple but bad - we shouldn't save state in the model. */

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. \
 * Methods in return closureL
 * constructorAddition
 * onLoad
 * onUnload
 * onResize
 * setData
 * getData
 * isCloseOk
 * destroy
 * init
 * setStartEditMode
 * 
 * */
apogeeapp.app.CustomDataComponent2 = function(workspaceUI,folder) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,folder,apogeeapp.app.CustomDataComponent2);
    
    //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
    folder.setChildrenWriteable(false);
    
    //load these!
    this.dataTable = folder.lookupChildFromPathArray(["data"]);
    this.controlTable = folder.lookupChildFromPathArray(["control"]);
    this.isInputValidFunctionTable = folder.lookupChildFromPathArray(["isInputValid"]);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    
    //keep alive or destroy on inactive
    this.destroyOnInactive = false;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.CustomDataComponent2.readFromJson);
    this.addSaveAction(apogeeapp.app.CustomDataComponent2.writeToJson);
};

apogeeapp.app.CustomDataComponent2.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.CustomDataComponent2.prototype.constructor = apogeeapp.app.CustomDataComponent2;

//==============================
//Resource Accessors
//==============================

apogeeapp.app.CustomDataComponent2.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

apogeeapp.app.CustomDataComponent2.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

apogeeapp.app.CustomDataComponent2.prototype.getDestroyOnInactive = function() {
    return this.destroyOnInactive;
}

apogeeapp.app.CustomDataComponent2.prototype.getDisplayDestroyFlags = function() {
    return this.destroyOnInactive ? apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE :
            apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
}

apogeeapp.app.CustomDataComponent2.prototype.setDestroyOnInactive = function(destroyOnInactive) {
    this.destroyOnInactive = destroyOnInactive;
    
    if(this.activeOutputMode) {
        this.activeOutputMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.CustomDataComponent2.CODE_FIELD_HTML = "html";
apogeeapp.app.CustomDataComponent2.CODE_FIELD_CSS = "css";

apogeeapp.app.CustomDataComponent2.VIEW_OUTPUT = "Output";
apogeeapp.app.CustomDataComponent2.VIEW_VALUE = "Value";
apogeeapp.app.CustomDataComponent2.VIEW_CODE = "Model Code";
apogeeapp.app.CustomDataComponent2.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.CustomDataComponent2.VIEW_HTML = "HTML";
apogeeapp.app.CustomDataComponent2.VIEW_CSS = "CSS";
apogeeapp.app.CustomDataComponent2.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.CustomDataComponent2.VIEW_MODES = [
	apogeeapp.app.CustomDataComponent2.VIEW_OUTPUT,
    apogeeapp.app.CustomDataComponent2.VIEW_VALUE,
	apogeeapp.app.CustomDataComponent2.VIEW_CODE,
    apogeeapp.app.CustomDataComponent2.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.CustomDataComponent2.VIEW_HTML,
    apogeeapp.app.CustomDataComponent2.VIEW_CSS,
    apogeeapp.app.CustomDataComponent2.VIEW_DESCRIPTION
];

apogeeapp.app.CustomDataComponent2.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.CustomDataComponent2.VIEW_MODES,
    "defaultView": apogeeapp.app.CustomDataComponent2.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.CustomDataComponent2.prototype.getTableEditSettings = function() {
    return apogeeapp.app.CustomDataComponent2.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.CustomDataComponent2.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.CustomDataComponent2.VIEW_OUTPUT:
            viewMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            this.activeOutputMode = viewMode;
            var callbacks = this.getFormEditorCallbacks();
            var html = this.getUiCodeField(apogeeapp.app.CustomDataComponent2.CODE_FIELD_HTML);
            var resource = this.controlTable.getData();
            var dataDisplay = new apogeeapp.app.HtmlJsDataEditor2(viewMode,callbacks,this.controlTable,html,resource);
            return dataDisplay;
            
        case apogeeapp.app.CustomDataComponent2.VIEW_VALUE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.dataTable);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
			
		case apogeeapp.app.CustomDataComponent2.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.controlTable);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.CustomDataComponent2.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.controlTable);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.CustomDataComponent2.VIEW_HTML:
            callbacks = this.getCallbacks(apogeeapp.app.CustomDataComponent2.CODE_FIELD_HTML);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/html");
    
        case apogeeapp.app.CustomDataComponent2.VIEW_CSS:
            callbacks = this.getCallbacks(apogeeapp.app.CustomDataComponent2.CODE_FIELD_CSS);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/css");
            
        case apogeeapp.app.CustomDataComponent2.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.controlTable);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}


apogeeapp.app.CustomDataComponent2.prototype.getFormEditorCallbacks = function() {
    var callbacks = {};
    
    //return desired form value
    callbacks.getData = () => this.dataTable.getData();
    
    //edit ok - always true
    callbacks.getEditOk = () => true;
    
    //save data - just form value here
    var messenger = new apogee.action.Messenger(this.controlTable);
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


apogeeapp.app.CustomDataComponent2.prototype.getCallbacks = function(codeField) {
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
apogeeapp.app.CustomDataComponent2.prototype.updateFromJson = function(json) {  
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.app.CustomDataComponent2.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	}  
    this.update(uiCodeFields);
}

//=============================
// Action
//=============================

apogeeapp.app.CustomDataComponent2.prototype.update = function(uiCodeFields) { 
    
    //make sure we get rid of the old display
    if(this.activeOutputMode) {
        this.activeOutputMode.forceClearDisplay();
    }
    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(apogeeapp.app.CustomDataComponent2.CODE_FIELD_CSS);
    
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

apogeeapp.app.CustomDataComponent2.readFromJson = function(json) {
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
apogeeapp.app.CustomDataComponent2.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
    json.destroyOnInactive = this.destroyOnInactive;
}

apogeeapp.app.CustomDataComponent2.addPropFunction = function(component,values) {
    values.destroyOnHide = component.getDestroyOnInactive();
}

apogeeapp.app.CustomDataComponent2.updateProperties = function(component,oldValues,newValues) {
    component.setDestroyOnInactive(newValues.destroyOnHide);
}

//======================================
// Static methods
//======================================

apogeeapp.app.CustomDataComponent2.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.Folder.generator.type;
    json.childrenNotWriteable = true;
    //add the children
    json.children = {
        "control": {
            "name": "control",
            "type": "apogee.JavascriptTable",
            "updateData": {
                "data": {},
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

apogeeapp.app.CustomDataComponent2.displayName = "Custom Data Component";
apogeeapp.app.CustomDataComponent2.uniqueName = "apogeeapp.app.CustomDataComponent2";
apogeeapp.app.CustomDataComponent2.DEFAULT_WIDTH = 500;
apogeeapp.app.CustomDataComponent2.DEFAULT_HEIGHT = 500;
apogeeapp.app.CustomDataComponent2.ICON_RES_PATH = "/componentIcons/formControl.png";

apogeeapp.app.CustomDataComponent2.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];



