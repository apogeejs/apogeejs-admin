
/** This component represents a json table object. */
visicomp.app.visiui.GridTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    visicomp.app.visiui.Component.init.call(this,workspaceUI,table,visicomp.app.visiui.GridTableComponent.generator,componentJson);
	visicomp.app.visiui.TableEditComponent.init.call(this,
		visicomp.app.visiui.GridTableComponent.VIEW_MODES,
		visicomp.app.visiui.GridTableComponent.DEFAULT_VIEW,
		visicomp.app.visiui.GridTableComponent.BLANK_DATA_VALUE_INFO
	);
    
    this.memberUpdated();
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.GridTableComponent,visicomp.app.visiui.Component);
visicomp.core.util.mixin(visicomp.app.visiui.GridTableComponent,visicomp.app.visiui.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

visicomp.app.visiui.GridTableComponent.VIEW_GRID = "Grid";
visicomp.app.visiui.GridTableComponent.VIEW_CODE = "Formula";
visicomp.app.visiui.GridTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

visicomp.app.visiui.GridTableComponent.VIEW_MODES = [
	visicomp.app.visiui.GridTableComponent.VIEW_GRID,
    visicomp.app.visiui.GridTableComponent.VIEW_CODE,
    visicomp.app.visiui.GridTableComponent.VIEW_SUPPLEMENTAL_CODE
];

visicomp.app.visiui.GridTableComponent.BLANK_DATA_VALUE_INFO = {
	"dataValue":[[null]],
	"menuLabel":"Clear Formula"
};

visicomp.app.visiui.GridTableComponent.DEFAULT_VIEW = visicomp.app.visiui.GridTableComponent.VIEW_GRID;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
visicomp.app.visiui.GridTableComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case visicomp.app.visiui.GridTableComponent.VIEW_CODE:
			return new visicomp.app.visiui.AceCodeMode(this,visicomp.app.visiui.GridTableComponent.BLANK_DATA_VALUE_INFO,visicomp.app.visiui.JsonTableComponent.editorCodeWrapper);
			
		case visicomp.app.visiui.GridTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new visicomp.app.visiui.AceSupplementalMode(this);
			
		case visicomp.app.visiui.GridTableComponent.VIEW_GRID:
			return new visicomp.app.visiui.HandsonGridMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


visicomp.app.visiui.GridTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = visicomp.core.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    var actionResponse = visicomp.core.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new visicomp.app.visiui.GridTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


visicomp.app.visiui.GridTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new visicomp.app.visiui.GridTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

visicomp.app.visiui.GridTableComponent.generator = {};
visicomp.app.visiui.GridTableComponent.generator.displayName = "Grid Table";
visicomp.app.visiui.GridTableComponent.generator.uniqueName = "visicomp.app.visiui.GridTableComponent";
visicomp.app.visiui.GridTableComponent.generator.createComponent = visicomp.app.visiui.GridTableComponent.createComponent;
visicomp.app.visiui.GridTableComponent.generator.createComponentFromJson = visicomp.app.visiui.GridTableComponent.createComponentFromJson;
visicomp.app.visiui.GridTableComponent.generator.DEFAULT_WIDTH = 200;
visicomp.app.visiui.GridTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// Use the json table code wrapper
//======================================

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


