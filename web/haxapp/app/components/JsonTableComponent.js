/** This component represents a json table object. */
haxapp.app.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,table,haxapp.app.JsonTableComponent.generator,componentJson);
	
    this.memberUpdated();
};

haxapp.app.JsonTableComponent.prototype = Object.create(haxapp.app.EditComponent.prototype);
haxapp.app.JsonTableComponent.prototype.constructor = haxapp.app.JsonTableComponent;

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT = "Text";
haxapp.app.JsonTableComponent.VIEW_JSON_TEXT = "JSON";
haxapp.app.JsonTableComponent.VIEW_FORM = "Form";
haxapp.app.JsonTableComponent.VIEW_CODE = "Formula";
haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.JsonTableComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.JsonTableComponent.VIEW_MODES = [
    haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT,
    haxapp.app.JsonTableComponent.VIEW_JSON_TEXT,
    haxapp.app.JsonTableComponent.VIEW_FORM,
    haxapp.app.JsonTableComponent.VIEW_CODE,
    haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.JsonTableComponent.VIEW_DESCRIPTION
];

haxapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.JsonTableComponent.VIEW_MODES,
    "defaultView": haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": ""
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
haxapp.app.JsonTableComponent.prototype.getTableEditSettings = function() {
    return haxapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.JsonTableComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
        case haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT:
            return new haxapp.app.AceDataMode(editComponentDisplay,false);
            
		case haxapp.app.JsonTableComponent.VIEW_JSON_TEXT:
			return new haxapp.app.AceDataMode(editComponentDisplay,true);
			
		case haxapp.app.JsonTableComponent.VIEW_FORM:
			return new haxapp.app.FormDataMode(editComponentDisplay);
			
		case haxapp.app.JsonTableComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay,haxapp.app.JsonTableComponent.BLANK_DATA_VALUE_INFO,haxapp.app.JsonTableComponent.editorCodeWrapper);
			
		case haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
            
        case haxapp.app.JsonTableComponent.VIEW_DESCRIPTION:
			return new haxapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


haxapp.app.JsonTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.name = data.name;
    json.type = hax.JsonTable.generator.type;
    var actionResponse = hax.action.doAction(workspaceUI.getWorkspace(),json);
    
    var table = json.member;
    if(table) {
        var tableComponent = new haxapp.app.JsonTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


haxapp.app.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new haxapp.app.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.JsonTableComponent.generator = {};
haxapp.app.JsonTableComponent.generator.displayName = "Data Table";
haxapp.app.JsonTableComponent.generator.uniqueName = "haxapp.app.JsonTableComponent";
haxapp.app.JsonTableComponent.generator.createComponent = haxapp.app.JsonTableComponent.createComponent;
haxapp.app.JsonTableComponent.generator.createComponentFromJson = haxapp.app.JsonTableComponent.createComponentFromJson;
haxapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 300;
haxapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 300;
haxapp.app.JsonTableComponent.generator.ICON_RES_PATH = "/dataIcon.png";

