/** This component represents a table object. */
apogeeapp.app.FunctionComponent = function(workspaceUI, functionObject) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,functionObject,apogeeapp.app.FunctionComponent);
};

apogeeapp.app.FunctionComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.FunctionComponent.prototype.constructor = apogeeapp.app.FunctionComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.FunctionComponent.VIEW_CODE = "Code";
apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FunctionComponent.VIEW_MODES = [
    apogeeapp.app.FunctionComponent.VIEW_CODE,
    apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FunctionComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FunctionComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FunctionComponent.VIEW_CODE
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.FunctionComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.FunctionComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.FunctionComponent.prototype.getDataDisplay = function(displayContainer,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.FunctionComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
			return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION:
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

apogeeapp.app.FunctionComponent.createMemberJson = function(userInputValues,optionalBaseJson) {
    var json = apogeeapp.app.Component.createMemberJson(apogeeapp.app.FunctionComponent,userInputValues,optionalBaseJson);
    if(userInputValues.argListString) { 
        if(!json.updateData) {
            json.updateData = {};
        }
        json.updateData.argList = apogee.FunctionTable.parseStringArray(userInputValues.argListString);
    }
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FunctionComponent.displayName = "Function";
apogeeapp.app.FunctionComponent.uniqueName = "apogeeapp.app.FunctionComponent";
apogeeapp.app.FunctionComponent.DEFAULT_WIDTH = 400;
apogeeapp.app.FunctionComponent.DEFAULT_HEIGHT = 400;
apogeeapp.app.FunctionComponent.ICON_RES_PATH = "/componentIcons/functionTable.png";
apogeeapp.app.FunctionComponent.DEFAULT_MEMBER_JSON = {
    "type": apogee.FunctionTable.generator.type
};
apogeeapp.app.FunctionComponent.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];
