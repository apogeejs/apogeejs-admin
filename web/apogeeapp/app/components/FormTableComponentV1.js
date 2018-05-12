/** This component represents a json table object. */
apogeeapp.app.FormTableComponent = function(workspaceUI,folder) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,folder,apogeeapp.app.FormTableComponent);
    
    //load these!
    this.dataTable = folder.lookupChildFromPathArray(["data"]) ;
    this.layoutTable = folder.lookupChildFromPathArray(["layout"]) ;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.FormTableComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.FormTableComponent.writeToJson);
};

apogeeapp.app.FormTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.FormTableComponent.prototype.constructor = apogeeapp.app.FormTableComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.FormTableComponent.VIEW_FORM = "Form";
apogeeapp.app.FormTableComponent.VIEW_LAYOUT_CODE = "Layout Code";
apogeeapp.app.FormTableComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE = "Layout Private";
apogeeapp.app.FormTableComponent.VIEW_FORM_VALUE = "Form Value";
apogeeapp.app.FormTableComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FormTableComponent.VIEW_MODES = [
    apogeeapp.app.FormTableComponent.VIEW_FORM,
    apogeeapp.app.FormTableComponent.VIEW_LAYOUT_CODE,
    apogeeapp.app.FormTableComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE,
    apogeeapp.app.FormTableComponent.VIEW_FORM_VALUE,
    apogeeapp.app.FormTableComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FormTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FormTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FormTableComponent.VIEW_FORM,
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.FormTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.FormTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.FormTableComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
    
	//create the new view element;
	switch(viewType) {
            
        case apogeeapp.app.FormTableComponent.VIEW_FORM:
            viewMode.setDisplayDestroyFlags(this.displayDestroyFlags);
            this.outputMode = viewMode;
            return this.getOutputDisplay(viewMode);
			
		case apogeeapp.app.FormTableComponent.VIEW_LAYOUT_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.layoutTable,apogeeapp.app.FormTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.FormTableComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.layoutTable,apogeeapp.app.FormTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.FormTableComponent.VIEW_FORM_DATA:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.dataTable);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
            
        case apogeeapp.app.FormTableComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.dataTable);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This creates a form whose layout is the member value. */
apogeeapp.app.FormTableComponent.prototype.getOutputDisplay = function(viewMode) {
    
    var getLayoutInfo = () => {
        var formLayoutInfo = this.layoutTable.getData();
        var formValue = this.dataTable.getData();
        var messenger = new apogee.action.Messenger(this.layoutTable);
        
        return apogeeapp.app.FormTableComponent.createGetLayoutInfo(formLayoutInfo,formValue,messenger);
    } 
    
    //////////////////////////////////////////////////////
    //var getLayoutInfo = () => this.layoutTable.getData();
    return new apogeeapp.app.ConfigurableFormDisplay(viewMode,getLayoutInfo);
}

/** This static method constructs the form layout from the input layout and the input value. */
apogeeapp.app.FormTableComponent.createGetLayoutInfo = function(formLayoutInfo,formValue,messenger) {
    
    var layout = apogee.util.jsonCopy(formLayoutInfo.layout);
    var doClear = formLayoutInfo.doClear;
    var clearValue = formLayoutInfo.clearValue;
    var checkDataInvalid = formLayoutInfo.checkDataInvalid;
    
    var onSave = (formData) => {
        if(checkDataInvalid) {
            //check data invalid returns false or a message
            var invalidResult = checkDataInvalid(formData);
            if(invalidResult) {
                alert(invalidResult.errorMessage);
                return;
            }
        }

        messenger.dataUpdate("data",formData);
    }

    if(doClear) {
        var onClear = () => {
            messenger.dataUpdate("data",clearValue);
        }
    }

    var onChange = (value,form) => {
        var submitElement = form.getEntry("submitElement");
        if(apogee.util.jsonEquals(value,formValue)) {
            submitElement.submitDisable(true);
        }
        else {
            submitElement.submitDisable(false);
        }
    }

    layout.map(element => apogeeapp.app.FormTableComponent.setElementValue(element,formValue));

    //submit (no cancel)
    var entry = {};
    entry.type = "submit";
    entry.onSubmit = onSave;
    entry.submitLabel = "Save";
    if(doClear) {
        entry.onCancel = onClear;
        entry.cancelLabel = "Clear";
    }
    entry.key = "submitElement";
    layout.push(entry);

    //return value
    var data = {};
    data.layout = layout;
    data.onChange = onChange;
    return data;
}

apogeeapp.app.FormTableComponent.setElementValue = function(element,formValue) {
    if(element.type == "panel") {
        //compound element
        if(formValue) {
           var childValue = formValue[element.key];
           setFormValue(element.layout,childValue,null);
        }
    }
    if(element.default != undefined) {
        //simple valued elements
        if((formValue)&&(formValue[element.key] != undefined)) {
            element.value = formValue[element.key];
        }
        else {
            element.value = element.default;
        }
        
    }
}


//======================================
// Static methods
//======================================

apogeeapp.app.FormTableComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
    return json;
}

apogeeapp.app.FormTableComponent.getCreateMemberPayload = function(userInputValues) {
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
                "description": ""
            }
        },
        "data": {
            "name": "data",
            "type": "apogee.JsonTable",
            "updateData": {
                "data": "",
                "description": ""
            }
        }
    };
    return json;
}

apogeeapp.app.FormTableComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.FormTableComponent.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FormTableComponent.displayName = "Form Table";
apogeeapp.app.FormTableComponent.uniqueName = "apogeeapp.app.FormTableComponent";
apogeeapp.app.FormTableComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.FormTableComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.FormTableComponent.ICON_RES_PATH = "/componentIcons/formControl.png";

