
/** This component represents a json table object. */
haxapp.app.GridTableComponent = function(workspaceUI,table,componentJson) {
    //extend edit component
    haxapp.app.EditComponent.call(this,workspaceUI,table,haxapp.app.GridTableComponent.generator,componentJson);
    
    this.memberUpdated();
};

haxapp.app.GridTableComponent.prototype = Object.create(haxapp.app.EditComponent.prototype);
haxapp.app.GridTableComponent.prototype.constructor = haxapp.app.GridTableComponent;

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.GridTableComponent.VIEW_GRID = "Grid";
haxapp.app.GridTableComponent.VIEW_CODE = "Formula";
haxapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.GridTableComponent.VIEW_DESCRIPTION = "Notes";

haxapp.app.GridTableComponent.VIEW_MODES = [
	haxapp.app.GridTableComponent.VIEW_GRID,
    haxapp.app.GridTableComponent.VIEW_CODE,
    haxapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.GridTableComponent.VIEW_DESCRIPTION
];

haxapp.app.GridTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": haxapp.app.GridTableComponent.VIEW_MODES,
    "defaultView": haxapp.app.GridTableComponent.VIEW_GRID,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": [[null]]
}

haxapp.app.GridTableComponent.DEFAULT_VIEW = haxapp.app.GridTableComponent.VIEW_GRID;

/**  This method retrieves the table edit settings for this component instance
 * @protected */
haxapp.app.GridTableComponent.prototype.getTableEditSettings = function() {
    return haxapp.app.GridTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.GridTableComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case haxapp.app.GridTableComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(editComponentDisplay,haxapp.app.GridTableComponent.BLANK_DATA_VALUE_INFO,haxapp.app.JsonTableComponent.editorCodeWrapper);
			
		case haxapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(editComponentDisplay);
			
		case haxapp.app.GridTableComponent.VIEW_GRID:
			return new haxapp.app.HandsonGridMode(editComponentDisplay);
            
        case haxapp.app.GridTableComponent.VIEW_DESCRIPTION:
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


haxapp.app.GridTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.name = data.name;
    json.type = hax.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    var actionResponse = hax.action.doAction(workspaceUI.getWorkspace(),json);
    
    var table = json.member;
    if(table) {
        var tableComponent = new haxapp.app.GridTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


haxapp.app.GridTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new haxapp.app.GridTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.GridTableComponent.generator = {};
haxapp.app.GridTableComponent.generator.displayName = "Grid Table";
haxapp.app.GridTableComponent.generator.uniqueName = "haxapp.app.GridTableComponent";
haxapp.app.GridTableComponent.generator.createComponent = haxapp.app.GridTableComponent.createComponent;
haxapp.app.GridTableComponent.generator.createComponentFromJson = haxapp.app.GridTableComponent.createComponentFromJson;
haxapp.app.GridTableComponent.generator.DEFAULT_WIDTH = 200;
haxapp.app.GridTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// Use the json table code wrapper
//======================================

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


