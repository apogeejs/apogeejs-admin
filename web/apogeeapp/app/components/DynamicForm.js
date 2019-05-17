/** This component represents a table object. */
apogeeapp.app.DynamicForm = function(workspaceUI, functionObject) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,functionObject,apogeeapp.app.DynamicForm);
};

apogeeapp.app.DynamicForm.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.DynamicForm.prototype.constructor = apogeeapp.app.DynamicForm;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.DynamicForm.VIEW_FORM = "Form";
apogeeapp.app.DynamicForm.VIEW_CODE = "Code";
apogeeapp.app.DynamicForm.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.DynamicForm.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.DynamicForm.VIEW_MODES = [
    apogeeapp.app.DynamicForm.VIEW_FORM,
    apogeeapp.app.DynamicForm.VIEW_CODE,
    apogeeapp.app.DynamicForm.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.DynamicForm.VIEW_DESCRIPTION
];

apogeeapp.app.DynamicForm.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.DynamicForm.VIEW_MODES,
    "defaultView": apogeeapp.app.DynamicForm.VIEW_FORM
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.DynamicForm.prototype.getTableEditSettings = function() {
    return apogeeapp.app.DynamicForm.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.DynamicForm.prototype.getDataDisplay = function(displayContainer,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
        
        case apogeeapp.app.DynamicForm.VIEW_FORM:
            callbacks = this.getFormCallbacks();
            return new apogeeapp.app.ConfigurableFormDisplay(displayContainer,callbacks);
			
		case apogeeapp.app.DynamicForm.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
			return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.DynamicForm.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.DynamicForm.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(displayContainer,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.DynamicForm.prototype.getFormCallbacks = function() {
    var callbacks = {
            getData: () => {              
                let layoutFunction = this.member.getData();
                //need to define admin!
                let admin = {
                    getMessenger: () => new apogee.action.Messenger(this.member),
                }
                return layoutFunction(admin);
            }
        }
    return callbacks;
}
        

apogeeapp.app.DynamicForm.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.updateData = {};
    json.updateData.argList = apogeeapp.app.DynamicForm.STANDARD_ARG_LIST;
    json.type = apogee.FunctionTable.generator.type;
    return json;
}

apogeeapp.app.DynamicForm.STANDARD_ARG_LIST = ["admin"];

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.DynamicForm.displayName = "Dynamic Form";
apogeeapp.app.DynamicForm.uniqueName = "apogeeapp.app.DynamicForm";
apogeeapp.app.DynamicForm.DEFAULT_WIDTH = 400;
apogeeapp.app.DynamicForm.DEFAULT_HEIGHT = 400;
apogeeapp.app.DynamicForm.ICON_RES_PATH = "/componentIcons/functionTable.png";
