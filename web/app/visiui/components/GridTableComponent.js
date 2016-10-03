
/** This component represents a json table object. */
hax.app.visiui.GridTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    hax.app.visiui.Component.init.call(this,workspaceUI,table,hax.app.visiui.GridTableComponent.generator,componentJson);
	hax.app.visiui.TableEditComponent.init.call(this,
		hax.app.visiui.GridTableComponent.VIEW_MODES,
		hax.app.visiui.GridTableComponent.DEFAULT_VIEW,
		hax.app.visiui.GridTableComponent.BLANK_DATA_VALUE_INFO
	);
    
    this.memberUpdated();
};

//add components to this class
hax.core.util.mixin(hax.app.visiui.GridTableComponent,hax.app.visiui.Component);
hax.core.util.mixin(hax.app.visiui.GridTableComponent,hax.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

hax.app.visiui.GridTableComponent.VIEW_GRID = "Grid";
hax.app.visiui.GridTableComponent.VIEW_CODE = "Formula";
hax.app.visiui.GridTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

hax.app.visiui.GridTableComponent.VIEW_MODES = [
	hax.app.visiui.GridTableComponent.VIEW_GRID,
    hax.app.visiui.GridTableComponent.VIEW_CODE,
    hax.app.visiui.GridTableComponent.VIEW_SUPPLEMENTAL_CODE
];

hax.app.visiui.GridTableComponent.BLANK_DATA_VALUE_INFO = {
	"dataValue":[[null]],
	"menuLabel":"Clear Formula"
};

hax.app.visiui.GridTableComponent.DEFAULT_VIEW = hax.app.visiui.GridTableComponent.VIEW_GRID;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
hax.app.visiui.GridTableComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case hax.app.visiui.GridTableComponent.VIEW_CODE:
			return new hax.app.visiui.AceCodeMode(this,hax.app.visiui.GridTableComponent.BLANK_DATA_VALUE_INFO,hax.app.visiui.JsonTableComponent.editorCodeWrapper);
			
		case hax.app.visiui.GridTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new hax.app.visiui.AceSupplementalMode(this);
			
		case hax.app.visiui.GridTableComponent.VIEW_GRID:
			return new hax.app.visiui.HandsonGridMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


hax.app.visiui.GridTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.core.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    var actionResponse = hax.core.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new hax.app.visiui.GridTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


hax.app.visiui.GridTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new hax.app.visiui.GridTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

hax.app.visiui.GridTableComponent.generator = {};
hax.app.visiui.GridTableComponent.generator.displayName = "Grid Table";
hax.app.visiui.GridTableComponent.generator.uniqueName = "hax.app.visiui.GridTableComponent";
hax.app.visiui.GridTableComponent.generator.createComponent = hax.app.visiui.GridTableComponent.createComponent;
hax.app.visiui.GridTableComponent.generator.createComponentFromJson = hax.app.visiui.GridTableComponent.createComponentFromJson;
hax.app.visiui.GridTableComponent.generator.DEFAULT_WIDTH = 200;
hax.app.visiui.GridTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// Use the json table code wrapper
//======================================

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


