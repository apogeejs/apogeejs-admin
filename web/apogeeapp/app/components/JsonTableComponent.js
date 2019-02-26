/** This component represents a json table object. */
apogeeapp.app.JsonTableComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.JsonTableComponent);

    //default view
    this.dataView = apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.JsonTableComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.JsonTableComponent.writeToJson);
};

apogeeapp.app.JsonTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JsonTableComponent.prototype.constructor = apogeeapp.app.JsonTableComponent;

apogeeapp.app.JsonTableComponent.prototype.getDataView = function() {
    if(!this.dataView) this.dataView = apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW;
    return this.dataView;
}

apogeeapp.app.JsonTableComponent.prototype.setDataView = function(dataView) {
    this.dataView = dataView;
    //update the window display if needed
    var componentDisplay = this.getComponentDisplay();
    if(componentDisplay) {
        componentDisplay.updateViewModeElement(apogeeapp.app.JsonTableComponent.VIEW_DATA);
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
apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW = "Colorized";
apogeeapp.app.JsonTableComponent.TEXT_DATA_VEW = "Text Data";
apogeeapp.app.JsonTableComponent.GRID_DATA_VEW = "Grid";
apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW = "Form";

apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW = apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW;;


/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.JsonTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.JsonTableComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
    
	//create the new view element;
	switch(viewType) {
        case apogeeapp.app.JsonTableComponent.VIEW_DATA:
            switch(this.dataView) {
                case apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
                    
                case apogeeapp.app.JsonTableComponent.TEXT_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
                    
                case apogeeapp.app.JsonTableComponent.GRID_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                    return new apogeeapp.app.HandsonGridEditor(viewMode,callbacks);

                case apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW:
                    alert("FORM EDITOR NOT IMPLEMENTED YET!");
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                    //return new apogeeapp.app.FormDataMode(editComponentDisplay);
                    //drop through to below
                    
                case apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW:
                default:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            }
			
		case apogeeapp.app.JsonTableComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member,apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member,apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION:
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

apogeeapp.app.JsonTableComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
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
apogeeapp.app.JsonTableComponent.ICON_RES_PATH = "/componentIcons/dataTable.png";
apogeeapp.app.JsonTableComponent.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Data View: ",
        "entries":[
            "Colorized",
            "Plain",
            "Text Data",
            "Grid",
            "Form"
        ],
        "resultKey":"dataView"
    }
];

