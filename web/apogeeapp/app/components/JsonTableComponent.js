/** This component represents a json table object. */
apogeeapp.app.JsonTableComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.JsonTableComponent);

    //default view
    this.dataView = apogeeapp.app.JsonTableComponent.JSON_DATA_VEW;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.JsonTableComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.JsonTableComponent.writeToJson);
};

apogeeapp.app.JsonTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JsonTableComponent.prototype.constructor = apogeeapp.app.JsonTableComponent;

apogeeapp.app.JsonTableComponent.prototype.getDataView = function() {
    if(!this.dataView) this.dataView = "JSON";
    return this.dataView;
}

apogeeapp.app.JsonTableComponent.prototype.setDataView = function(dataView) {
    this.dataView = dataView;
    //update the window display if needed
    var windowDisplay = this.getWindowDisplay();
    if(windowDisplay) {
        windowDisplay.updateViewModeElement(apogeeapp.app.JsonTableComponent.VIEW_DATA);
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.JsonTableComponent.VIEW_DATA = "Data";
apogeeapp.app.JsonTableComponent.VIEW_CODE = "Formula";
apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.JsonTableComponent.VIEW_MODES = [
    apogeeapp.app.JsonTableComponent.VIEW_DATA,
    apogeeapp.app.JsonTableComponent.VIEW_CODE,
    apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION
];

apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.JsonTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.JsonTableComponent.VIEW_DATA,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": ""
}

apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW = "Plain";
apogeeapp.app.JsonTableComponent.JSON_DATA_VEW = "JSON";
apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW = "Form";


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
        case apogeeapp.app.JsonTableComponent.VIEW_DATA:
            switch(this.dataView) {
                case apogeeapp.app.JsonTableComponent.JSON_DATA_VEW:
                    return new apogeeapp.app.AceDataMode(editComponentDisplay,true);

                case apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW:
                    return new apogeeapp.app.FormDataMode(editComponentDisplay);
                    
                case apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW:
                default:
                    return new apogeeapp.app.AceDataMode(editComponentDisplay,false);
            }
			
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

apogeeapp.app.JsonTableComponent.getMemberCreateAction = function(userInputValues) {
    var json = {};
    json.action = "createMember";
    json.owner = userInputValues.parent;
    json.workspace = userInputValues.parent.getWorkspace();
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
    return json;
}

apogeeapp.app.JsonTableComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.JsonTableComponent.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
}

apogeeapp.app.JsonTableComponent.addPropFunction = function(component,values) {
    values.dataView = component.getDataView();
}

apogeeapp.app.JsonTableComponent.updateProperties = function(component,oldValues,newValues) {
    component.setDataView(newValues.dataView);
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.JsonTableComponent.displayName = "Data Table";
apogeeapp.app.JsonTableComponent.uniqueName = "apogeeapp.app.JsonTableComponent";
apogeeapp.app.JsonTableComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.JsonTableComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.JsonTableComponent.ICON_RES_PATH = "/dataIcon.png";
apogeeapp.app.JsonTableComponent.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Data View: ",
        "entries":[
            "JSON",
            "Plain",
            "Form"
        ],
        "resultKey":"dataView"
    }
];

