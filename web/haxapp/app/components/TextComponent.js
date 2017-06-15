
/** This component represents a json table object. */
haxapp.app.TextComponent = function(workspaceUI,table,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,table,haxapp.app.TextComponent.generator,componentJson);
    
    this.memberUpdated();
};

haxapp.app.TextComponent.prototype = Object.create(haxapp.app.EditComponent.prototype);
haxapp.app.TextComponent.prototype.constructor = haxapp.app.TextComponent;

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.TextComponent.VIEW_TEXT = "Text";
haxapp.app.TextComponent.VIEW_CODE = "Formula";
haxapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.TextComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.TextComponent.VIEW_MODES = [
	haxapp.app.TextComponent.VIEW_TEXT,
    haxapp.app.TextComponent.VIEW_CODE,
    haxapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.TextComponent.VIEW_DESCRIPTION
];

haxapp.app.TextComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.TextComponent.VIEW_MODES,
    "defaultView": haxapp.app.TextComponent.VIEW_TEXT,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": ""
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
haxapp.app.TextComponent.prototype.getTableEditSettings = function() {
    return haxapp.app.TextComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.TextComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case haxapp.app.TextComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay);
			
		case haxapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
			
		case haxapp.app.TextComponent.VIEW_TEXT:
			return new haxapp.app.AceTextMode(editComponentDisplay);
            
        case haxapp.app.TextComponent.VIEW_DESCRIPTION:
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


haxapp.app.TextComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.name = data.name;
    json.type = hax.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = "";
    var actionResponse = hax.action.doAction(json);
    
    var table = json.member;
    if(table) {
        var tableComponent = new haxapp.app.TextComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


haxapp.app.TextComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new haxapp.app.TextComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.TextComponent.generator = {};
haxapp.app.TextComponent.generator.displayName = "Text Table";
haxapp.app.TextComponent.generator.uniqueName = "haxapp.app.TextComponent";
haxapp.app.TextComponent.generator.createComponent = haxapp.app.TextComponent.createComponent;
haxapp.app.TextComponent.generator.createComponentFromJson = haxapp.app.TextComponent.createComponentFromJson;
haxapp.app.TextComponent.generator.DEFAULT_WIDTH = 300;
haxapp.app.TextComponent.generator.DEFAULT_HEIGHT = 300;
haxapp.app.TextComponent.generator.ICON_RES_PATH = "/textIcon.png";




