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

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.FunctionComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.FunctionComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        case apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.FunctionComponent.getMemberCreateAction = function(userInputValues) {
    var json = {};
    json.action = "createMember";
    json.owner = userInputValues.parent;
    json.workspace = userInputValues.parent.getWorkspace();
    json.name = userInputValues.name;
    var argList;
    if(userInputValues.argListString) {
        argList = apogee.FunctionTable.parseStringArray(userInputValues.argListString);  
    }
    else {
        argList = [];
    }
    json.updateData = {};
    json.updateData.argList = argList;
    json.type = apogee.FunctionTable.generator.type;
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FunctionComponent.displayName = "Function";
apogeeapp.app.FunctionComponent.uniqueName = "apogeeapp.app.FunctionComponent";
apogeeapp.app.FunctionComponent.DEFAULT_WIDTH = 400;
apogeeapp.app.FunctionComponent.DEFAULT_HEIGHT = 400;
apogeeapp.app.FunctionComponent.ICON_RES_PATH = "/functionIcon.png";

apogeeapp.app.FunctionComponent.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];

//apogeeapp.app.FunctionComponent.generator = {};
//apogeeapp.app.FunctionComponent.generator.displayName = "Function";
//apogeeapp.app.FunctionComponent.generator.uniqueName = "apogeeapp.app.FunctionComponent";
//apogeeapp.app.FunctionComponent.generator.constructor = apogeeapp.app.FunctionComponent;
//apogeeapp.app.FunctionComponent.generator.getMemberCreateAction = apogeeapp.app.FunctionComponent.getMemberCreateAction;
//apogeeapp.app.FunctionComponent.generator.DEFAULT_WIDTH = 400;
//apogeeapp.app.FunctionComponent.generator.DEFAULT_HEIGHT = 400;
//apogeeapp.app.FunctionComponent.generator.ICON_RES_PATH = "/functionIcon.png";
//
//apogeeapp.app.FunctionComponent.generator.propertyDialogLines = [
//    {
//        "type":"inputElement",
//        "heading":"Arg List: ",
//        "resultKey":"argListString"
//    }
//];

 