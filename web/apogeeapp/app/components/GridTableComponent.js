
/** This component represents a json table object. */
apogeeapp.app.GridTableComponent = function(workspaceUI,table,options) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.GridTableComponent.generator);
    
    this.setOptions(options);
    this.memberUpdated();
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


apogeeapp.app.GridTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = apogee.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    var actionResponse = apogee.action.doAction(json,true);
    
    var table = json.member;
    if(table) {
        var tableComponent = apogeeapp.app.GridTableComponent.createComponentFromMember(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


apogeeapp.app.GridTableComponent.createComponentFromMember = function(workspaceUI,member,componentJson) {
    return new apogeeapp.app.GridTableComponent(workspaceUI,member,componentJson);
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.GridTableComponent.generator = {};
apogeeapp.app.GridTableComponent.generator.displayName = "Grid Table";
apogeeapp.app.GridTableComponent.generator.uniqueName = "apogeeapp.app.GridTableComponent";
apogeeapp.app.GridTableComponent.generator.createComponent = apogeeapp.app.GridTableComponent.createComponent;
apogeeapp.app.GridTableComponent.generator.createComponentFromMember = apogeeapp.app.GridTableComponent.createComponentFromMember;
apogeeapp.app.GridTableComponent.generator.DEFAULT_WIDTH = 300;
apogeeapp.app.GridTableComponent.generator.DEFAULT_HEIGHT = 300;
apogeeapp.app.GridTableComponent.generator.ICON_RES_PATH = "/gridIcon.png";

//======================================
// Use the json table code wrapper
//======================================

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


