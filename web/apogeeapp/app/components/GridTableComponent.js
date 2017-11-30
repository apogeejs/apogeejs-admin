
/** This component represents a json table object. */
apogeeapp.app.GridTableComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.GridTableComponent);
};

apogeeapp.app.GridTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.GridTableComponent.prototype.constructor = apogeeapp.app.GridTableComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.GridTableComponent.VIEW_GRID = "Grid";
apogeeapp.app.GridTableComponent.VIEW_CODE = "Formula";
apogeeapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.GridTableComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.GridTableComponent.VIEW_MODES = [
	apogeeapp.app.GridTableComponent.VIEW_GRID,
    apogeeapp.app.GridTableComponent.VIEW_CODE,
    apogeeapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.GridTableComponent.VIEW_DESCRIPTION
];

apogeeapp.app.GridTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.GridTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.GridTableComponent.VIEW_GRID,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": [[null]]
}

apogeeapp.app.GridTableComponent.DEFAULT_VIEW = apogeeapp.app.GridTableComponent.VIEW_GRID;

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.GridTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.GridTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.GridTableComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.GridTableComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
			
		case apogeeapp.app.GridTableComponent.VIEW_GRID:
			return new apogeeapp.app.HandsonGridMode(editComponentDisplay);
            
        case apogeeapp.app.GridTableComponent.VIEW_DESCRIPTION:
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

apogeeapp.app.GridTableComponent.getMemberCreateAction = function(userInputValues) {
    var json = {};
    json.action = "createMember";
    json.owner = userInputValues.parent;
    json.workspace = userInputValues.parent.getWorkspace();
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.userInputValues = [[""]]; //empty single cell
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.GridTableComponent.displayName = "Grid Table";
apogeeapp.app.GridTableComponent.uniqueName = "apogeeapp.app.GridTableComponent";
apogeeapp.app.GridTableComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.GridTableComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.GridTableComponent.ICON_RES_PATH = "/gridIcon.png";

//apogeeapp.app.GridTableComponent.generator = {};
//apogeeapp.app.GridTableComponent.generator.displayName = "Grid Table";
//apogeeapp.app.GridTableComponent.generator.uniqueName = "apogeeapp.app.GridTableComponent";
//apogeeapp.app.GridTableComponent.generator.constructor = apogeeapp.app.GridTableComponent;
//apogeeapp.app.GridTableComponent.generator.getMemberCreateAction = apogeeapp.app.GridTableComponent.getMemberCreateAction;
//apogeeapp.app.GridTableComponent.generator.DEFAULT_WIDTH = 300;
//apogeeapp.app.GridTableComponent.generator.DEFAULT_HEIGHT = 300;
//apogeeapp.app.GridTableComponent.generator.ICON_RES_PATH = "/gridIcon.png";

//======================================
// Use the json table code wrapper
//======================================

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


