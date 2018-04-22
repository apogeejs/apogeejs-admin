
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

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.TextComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.TextComponent.VIEW_TEXT:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            
		case apogeeapp.app.TextComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member,apogeeapp.app.TextComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member,apogeeapp.app.TextComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.TextComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.TextComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = "";
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.TextComponent.displayName = "Text Table DEPRECATED";
apogeeapp.app.TextComponent.uniqueName = "apogeeapp.app.TextComponent";
apogeeapp.app.TextComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.TextComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.TextComponent.ICON_RES_PATH = "/componentIcons/textTable.png";

