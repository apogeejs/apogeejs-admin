
/** This component represents a json table object. */
apogeeapp.app.TextComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.TextComponent);
};

apogeeapp.app.TextComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.TextComponent.prototype.constructor = apogeeapp.app.TextComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.TextComponent.VIEW_TEXT = "Text";
apogeeapp.app.TextComponent.VIEW_CODE = "Formula";
apogeeapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.TextComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.TextComponent.VIEW_MODES = [
	apogeeapp.app.TextComponent.VIEW_TEXT,
    apogeeapp.app.TextComponent.VIEW_CODE,
    apogeeapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.TextComponent.VIEW_DESCRIPTION
];

apogeeapp.app.TextComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.TextComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.TextComponent.VIEW_TEXT,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": ""
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.TextComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.TextComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.TextComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.TextComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
			
		case apogeeapp.app.TextComponent.VIEW_TEXT:
			return new apogeeapp.app.AceTextMode(editComponentDisplay);
            
        case apogeeapp.app.TextComponent.VIEW_DESCRIPTION:
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

apogeeapp.app.TextComponent.getMemberCreateAction = function(userInputValues) {
    var json = {};
    json.action = "createMember";
    json.owner = userInputValues.parent;
    json.workspace = userInputValues.parent.getWorkspace();
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = "";
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.TextComponent.displayName = "Text Table";
apogeeapp.app.TextComponent.uniqueName = "apogeeapp.app.TextComponent";
apogeeapp.app.TextComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.TextComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.TextComponent.ICON_RES_PATH = "/textIcon.png";

//apogeeapp.app.TextComponent.generator = {};
//apogeeapp.app.TextComponent.generator.displayName = "Text Table";
//apogeeapp.app.TextComponent.generator.uniqueName = "apogeeapp.app.TextComponent";
//apogeeapp.app.TextComponent.generator.constructor = apogeeapp.app.TextComponent;
//apogeeapp.app.TextComponent.generator.getMemberCreateAction = apogeeapp.app.TextComponent.getMemberCreateAction;
//apogeeapp.app.TextComponent.generator.DEFAULT_WIDTH = 300;
//apogeeapp.app.TextComponent.generator.DEFAULT_HEIGHT = 300;
//apogeeapp.app.TextComponent.generator.ICON_RES_PATH = "/textIcon.png";




