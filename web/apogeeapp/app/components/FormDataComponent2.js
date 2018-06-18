/** THIS IS A FAILED EXPERIMENT, SO FAR
 * In this component, there is a form to add the target data table and validation function, 
 * as external tables. A restriction is that they must be in the same folder.
 * PROBLEM - the form table has no formal dependence on the data table in the code, 
 * so it doesn't update if the data table is updated.
 * 
 * I kept this in the repository in case I have a good solution, but it is not 
 * included in the app for now. 
 * */
apogeeapp.app.FormDataComponent2 = function(workspaceUI,member) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,member,apogeeapp.app.FormDataComponent2);
    
    //load these!
    this.dataTableName = null;
    this.isDataValidFunctionName = null;
    
    //keep the form display alive
    this.displayDestroyFlags = apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.FormDataComponent2.readFromJson);
    this.addSaveAction(apogeeapp.app.FormDataComponent2.writeToJson);
};

apogeeapp.app.FormDataComponent2.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.FormDataComponent2.prototype.constructor = apogeeapp.app.FormDataComponent2;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.FormDataComponent2.VIEW_FORM = "Form";
apogeeapp.app.FormDataComponent2.VIEW_LAYOUT_CODE = "Layout Function";
apogeeapp.app.FormDataComponent2.VIEW_LAYOUT_SUPPLEMENTAL_CODE = "Layout Private";
apogeeapp.app.FormDataComponent2.VIEW_LINKED_TABLES = "Linked Tables";
apogeeapp.app.FormDataComponent2.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FormDataComponent2.VIEW_MODES = [
    apogeeapp.app.FormDataComponent2.VIEW_FORM,
    apogeeapp.app.FormDataComponent2.VIEW_LAYOUT_CODE,
    apogeeapp.app.FormDataComponent2.VIEW_LAYOUT_SUPPLEMENTAL_CODE,
    apogeeapp.app.FormDataComponent2.VIEW_LINKED_TABLES,
    apogeeapp.app.FormDataComponent2.VIEW_DESCRIPTION
];

apogeeapp.app.FormDataComponent2.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FormDataComponent2.VIEW_MODES,
    "defaultView": apogeeapp.app.FormDataComponent2.VIEW_FORM,
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.FormDataComponent2.prototype.getTableEditSettings = function() {
    return apogeeapp.app.FormDataComponent2.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.FormDataComponent2.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
    
	//create the new view element;
	switch(viewType) {
            
        case apogeeapp.app.FormDataComponent2.VIEW_FORM:
            viewMode.setDisplayDestroyFlags(this.displayDestroyFlags);
            callbacks = this.getFormEditorCallbacks();
            this.formViewMode = viewMode;
            var formEditorDisplay = new apogeeapp.app.ConfigurableFormEditor(viewMode,callbacks);
            return formEditorDisplay;
			
		case apogeeapp.app.FormDataComponent2.VIEW_LAYOUT_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.getMember(),apogeeapp.app.FormDataComponent2.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.FormDataComponent2.VIEW_LAYOUT_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.getMember(),apogeeapp.app.FormDataComponent2.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.FormDataComponent2.VIEW_LINKED_TABLES:
            var callbacks = {
                getData: () => this._getLinkedFileData(),
                getEditOk: () => true,
                saveData: (formData) => this._saveLinkedFileData(formData)
            }
            return new apogeeapp.app.ConfigurableFormEditor(viewMode,callbacks,this._getLinkedFileLayout());

            
        case apogeeapp.app.FormDataComponent2.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.dataTable);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

apogeeapp.app.FormDataComponent2.prototype.getFormEditorCallbacks = function() {
    var callbacks = {};
    
    var dataTable;
    var isInputValidFunctionTable;
    var folder = this.getMember().getParent();
    if(this.dataTableName) {
        dataTable = folder.lookupChildFromPathArray([this.dataTableName]);
    }
    if(this.isInputValidName) {
        isInputValidFunctionTable = folder.lookupChildFromPathArray([this.isInputValidName]);
    }
    
    //return desired form value
    callbacks.getData = () => {
        if(dataTable) return dataTable.getData();
        else return null;
    }
    
    //return form layout
    callbacks.getLayoutInfo = () => this.getMember().getData();
    
    //edit ok - always true
    callbacks.getEditOk = () => true;
    
    //save data - just form value here
    var messenger = new apogee.action.Messenger(this.getMember());
    callbacks.saveData = (formValue) => {
        
        //validate input
        var isInputValid = isInputValidFunctionTable ? isInputValidFunctionTable.getData() : null;
        if(isInputValid) {
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
        }

        //save the data
        if(this.dataTableName) {
            messenger.dataUpdate(this.dataTableName,formValue);
        }
        else {
            alert("There is no result table set! Save has no effect.");
        }
        
        return true;
    }
    
    return callbacks;
}

//------------------------
// Linked table into
//------------------------

apogeeapp.app.FormDataComponent2.prototype._getLinkedFileData = function() {
    var formData = {};
    if(this.dataTableName != null) formData.dataTableName = this.dataTableName;
    if(this.isInputValidName != null) formData.isInputValidName = this.isInputValidName;
    return formData;
}

apogeeapp.app.FormDataComponent2.prototype._saveLinkedFileData = function(formData) {
    if(formData.dataTableName.length > 0) {
        this.dataTableName = formData.dataTableName;
    }
    else {
        alert("A data table name should be set!");
        //don't error here for now!
        this.dataTableName = null;
    }
    
    if(formData.isInputValidName.length > 0) {
        this.isInputValidName = formData.isInputValidName;
    }
    else {
        this.isInputValidName = null;
    }
    
    //reload the output form
    if(this.formViewMode) {
        this.formViewMode.forceClearDisplay();
    }
    
    return true;
}
        
apogeeapp.app.FormDataComponent2.prototype._getLinkedFileLayout = function() {
    var layoutInfo = {};
    layoutInfo.layout = [];
    var entry;
    
    //text field
    entry = {};
    entry.type = "textField";
    entry.key = "dataTableName";
    entry.label = "Value Table";
    entry.value = this.dataTableName ? this.dataTableName : "";
    layoutInfo.layout.push(entry);
    
    //validation field
    entry = {};
    entry.type = "textField";
    entry.key = "isInputValidName";
    entry.label = "isInputValid Function: ";
    entry.value = this.isInputValidName ? this.isInputValidName : "";
    layoutInfo.layout.push(entry);
 
    return layoutInfo;
}

//======================================
// Static methods
//======================================

apogeeapp.app.FormDataComponent2.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
    return json;
}

apogeeapp.app.FormDataComponent2.writeToJson = function(json) {
    json.dataView = this.dataView;
    if(this.dataTableName) json.dataTableName = this.dataTableName;
    if(this.isInputValidName) json.isInputValidName = this.isInputValidName;
}

apogeeapp.app.FormDataComponent2.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
    if(json.dataTableName) {
        this.dataTableName = json.dataTableName;
    }
    if(json.isInputValidName) {
        this.isInputValidName = json.isInputValidName;
    }
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FormDataComponent2.displayName = "Form Data Table 2";
apogeeapp.app.FormDataComponent2.uniqueName = "apogeeapp.app.FormDataComponent2";
apogeeapp.app.FormDataComponent2.DEFAULT_WIDTH = 300;
apogeeapp.app.FormDataComponent2.DEFAULT_HEIGHT = 300;
apogeeapp.app.FormDataComponent2.ICON_RES_PATH = "/componentIcons/formControl.png";

