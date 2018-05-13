/** This ccomponent represents a data value, with input being from a configurable form.
 * This is an example of componound component. The data associated with the form
 * can be accessed from the variables (componentName).data. There are also subtables
 * "layout" which contains the form layout and "isInputValid" which is a function
 * to validate form input.
 * If you want a form to take an action on submit rather than create and edit a 
 * data value, you can use the dynmaic form. */
apogeeapp.app.FormDataComponent = function(workspaceUI,folder) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,folder,apogeeapp.app.FormDataComponent);
    
    //load these!
    this.dataTable = folder.lookupChildFromPathArray(["data"]);
    this.layoutTable = folder.lookupChildFromPathArray(["layout"]);
    this.isInputValidFunctionTable = folder.lookupChildFromPathArray(["isInputValid"]);
    
    //keep the form display alive
    this.displayDestroyFlags = apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.FormDataComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.FormDataComponent.writeToJson);
};

apogeeapp.app.FormDataComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.FormDataComponent.prototype.constructor = apogeeapp.app.FormDataComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.FormDataComponent.VIEW_FORM = "Form";
apogeeapp.app.FormDataComponent.VIEW_LAYOUT_CODE = "Layout Code";
apogeeapp.app.FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE = "Layout Private";
apogeeapp.app.FormDataComponent.VIEW_FORM_VALUE = "Form Value";
apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_CODE = "isInputValid(formValue)";
apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE = "isInputValid Private";
apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FormDataComponent.VIEW_MODES = [
    apogeeapp.app.FormDataComponent.VIEW_FORM,
    apogeeapp.app.FormDataComponent.VIEW_LAYOUT_CODE,
    apogeeapp.app.FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE,
    apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_CODE,
    apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE,
    apogeeapp.app.FormDataComponent.VIEW_FORM_VALUE,
    apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FormDataComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FormDataComponent.VIEW_FORM,
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.FormDataComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.FormDataComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
    
	//create the new view element;
	switch(viewType) {
            
        case apogeeapp.app.FormDataComponent.VIEW_FORM:
            viewMode.setDisplayDestroyFlags(this.displayDestroyFlags);
            callbacks = this.getFormEditorCallbacks();
            var formEditorDisplay = new apogeeapp.app.ConfigurableFormEditor(viewMode,callbacks);
            return formEditorDisplay;
			
		case apogeeapp.app.FormDataComponent.VIEW_LAYOUT_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.layoutTable,apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.layoutTable,apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.FormDataComponent.VIEW_FORM_VALUE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.dataTable);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
            
        case apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.isInputValidFunctionTable,apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.isInputValidFunctionTable,apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.dataTable);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

apogeeapp.app.FormDataComponent.prototype.getFormEditorCallbacks = function() {
    var callbacks = {};
    
    //return desired form value
    callbacks.getData = () => this.dataTable.getData();
    
    //return form layout
    callbacks.getLayoutInfo = () => this.layoutTable.getData();
    
    //edit ok - always true
    callbacks.getEditOk = () => true;
    
    //save data - just form value here
    var messenger = new apogee.action.Messenger(this.layoutTable);
    callbacks.saveData = (formValue) => {
        
        //validate input
        var isInputValid = this.isInputValidFunctionTable.getData();
        var validateResult = isInputValid(formValue);
        if(validateResult !== true) {
            if(typeof validateResult == 'string') {
                alert(validateResult);
                return false;
            }
            else {
                alert("Improper format for isInputValid function. It should return true or an error message");
                return;
            }
        }

        //save the data
        messenger.dataUpdate("data",formValue);
        return true;
    }
    
    return callbacks;
}

//======================================
// Static methods
//======================================

apogeeapp.app.FormDataComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.Folder.generator.type;
    //add the children
    json.children = {
        "layout": {
            "name": "layout",
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

apogeeapp.app.FormDataComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.FormDataComponent.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FormDataComponent.displayName = "Form Data Table";
apogeeapp.app.FormDataComponent.uniqueName = "apogeeapp.app.FormDataComponent";
apogeeapp.app.FormDataComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.FormDataComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.FormDataComponent.ICON_RES_PATH = "/componentIcons/formControl.png";

