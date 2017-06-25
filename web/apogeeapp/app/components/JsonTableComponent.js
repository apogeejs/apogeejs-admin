/** This component represents a json table object. */
apogeeapp.app.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.JsonTableComponent.generator,componentJson);
	
    this.memberUpdated();
};

apogeeapp.app.JsonTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JsonTableComponent.prototype.constructor = apogeeapp.app.JsonTableComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.JsonTableComponent.VIEW_PLAIN_TEXT = "Text";
apogeeapp.app.JsonTableComponent.VIEW_JSON_TEXT = "JSON";
apogeeapp.app.JsonTableComponent.VIEW_FORM = "Form";
apogeeapp.app.JsonTableComponent.VIEW_CODE = "Formula";
apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.JsonTableComponent.VIEW_MODES = [
    apogeeapp.app.JsonTableComponent.VIEW_PLAIN_TEXT,
    apogeeapp.app.JsonTableComponent.VIEW_JSON_TEXT,
    apogeeapp.app.JsonTableComponent.VIEW_FORM,
    apogeeapp.app.JsonTableComponent.VIEW_CODE,
    apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION
];

apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.JsonTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.JsonTableComponent.VIEW_PLAIN_TEXT,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": ""
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.JsonTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.JsonTableComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
        case apogeeapp.app.JsonTableComponent.VIEW_PLAIN_TEXT:
            return new apogeeapp.app.AceDataMode(editComponentDisplay,false);
            
		case apogeeapp.app.JsonTableComponent.VIEW_JSON_TEXT:
			return new apogeeapp.app.AceDataMode(editComponentDisplay,true);
			
		case apogeeapp.app.JsonTableComponent.VIEW_FORM:
			return new apogeeapp.app.FormDataMode(editComponentDisplay);
			
		case apogeeapp.app.JsonTableComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        case apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION:
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


apogeeapp.app.JsonTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = apogee.JsonTable.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var table = json.member;
    if(table) {
        var tableComponent = new apogeeapp.app.JsonTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


apogeeapp.app.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new apogeeapp.app.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.JsonTableComponent.generator = {};
apogeeapp.app.JsonTableComponent.generator.displayName = "Data Table";
apogeeapp.app.JsonTableComponent.generator.uniqueName = "apogeeapp.app.JsonTableComponent";
apogeeapp.app.JsonTableComponent.generator.createComponent = apogeeapp.app.JsonTableComponent.createComponent;
apogeeapp.app.JsonTableComponent.generator.createComponentFromJson = apogeeapp.app.JsonTableComponent.createComponentFromJson;
apogeeapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 300;
apogeeapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 300;
apogeeapp.app.JsonTableComponent.generator.ICON_RES_PATH = "/dataIcon.png";

