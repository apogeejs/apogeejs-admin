/** This component represents a json table object. */
apogeeapp.app.ErrorTableComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.ErrorTableComponent);

    //default view
    this.dataView = apogeeapp.app.ErrorTableComponent.EMPTY_VIEW;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.ErrorTableComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.ErrorTableComponent.writeToJson);
};

apogeeapp.app.ErrorTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.ErrorTableComponent.prototype.constructor = apogeeapp.app.ErrorTableComponent;

apogeeapp.app.ErrorTableComponent.prototype.getDataView = function() {
    return this.dataView;
}

apogeeapp.app.ErrorTableComponent.prototype.setDataView = function(dataView) {
    //no action - data view is fixed
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.ErrorTableComponent.EMPTY_VIEW = "EMPTY_VIEW";

apogeeapp.app.ErrorTableComponent.VIEW_MODES = [
    apogeeapp.app.ErrorTableComponent.EMPTY_VIEW
];

apogeeapp.app.ErrorTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.ErrorTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.ErrorTableComponent.EMPTY_VIEW,
    "emptyDataValue": ""
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.ErrorTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.ErrorTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.ErrorTableComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
    return new apogeeapp.app.ErrorMode(editComponentDisplay,false);
}

//======================================
// Static methods
//======================================

apogeeapp.app.ErrorTableComponent.getCreateMemberPayload = function(userInputValues) {
    
    //we shouldn't be creating this - it should only be used to open from a json
    
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.ErrorTable.generator.type;
    return json;
}

/** This overrides the save method to return the original input. */
apogeeapp.app.ErrorTableComponent.prototype.toJson = function() {
    return this.completeJson;
}

/** This overrides the open deserialize method to save the entire json. */
apogeeapp.app.ErrorTableComponent.prototype.loadSerializedValues = function(json) {
    this.completeJson = json;
}

apogeeapp.app.ErrorTableComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.ErrorTableComponent.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.ErrorTableComponent.displayName = "Error Table";
apogeeapp.app.ErrorTableComponent.uniqueName = "apogeeapp.app.ErrorTableComponent";
apogeeapp.app.ErrorTableComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.ErrorTableComponent.DEFAULT_HEIGHT = 100;
apogeeapp.app.ErrorTableComponent.ICON_RES_PATH = "/componentIcons/genericDataTable.png";

