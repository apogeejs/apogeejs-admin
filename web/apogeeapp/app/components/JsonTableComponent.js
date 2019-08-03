/** This component represents a json table object. */
apogeeapp.app.JsonTableComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.JsonTableComponent);

    //default view
    this.dataView = apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW;
};

apogeeapp.app.JsonTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JsonTableComponent.prototype.constructor = apogeeapp.app.JsonTableComponent;

apogeeapp.app.JsonTableComponent.prototype.getDataView = function() {
    if(!this.dataView) this.dataView = apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW;
    return this.dataView;
}

apogeeapp.app.JsonTableComponent.prototype.setDataView = function(dataView) {
    if(this.dataView != dataView) {
        this.fieldUpdated("dataView");
        
        this.dataView = dataView;
        //update the window display if needed
        var componentDisplay = this.getComponentDisplay();
        if(componentDisplay) {
            alert("I need to fix set data view in json table!");
            //componentDisplay.updateViewModeElement(apogeeapp.app.JsonTableComponent.VIEW_DATA);
        }
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
    "emptyDataValue": ""
}

apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW = "Plain";
apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW = "Colorized";
apogeeapp.app.JsonTableComponent.TEXT_DATA_VEW = "Text Data";
apogeeapp.app.JsonTableComponent.GRID_DATA_VEW = "Grid";

apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW = apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW;;


/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.JsonTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.JsonTableComponent.prototype.getDataDisplay = function(displayContainer,viewType) {
	
    var callbacks;
    
	//create the new view element;
	switch(viewType) {
        case apogeeapp.app.JsonTableComponent.VIEW_DATA:
            switch(this.dataView) {
                case apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/json");
                    
                case apogeeapp.app.JsonTableComponent.TEXT_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                    
                case apogeeapp.app.JsonTableComponent.GRID_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                    return new apogeeapp.app.HandsonGridEditor(displayContainer,callbacks);
                    
                case apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW:
                default:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
            }
			
		case apogeeapp.app.JsonTableComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member,apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
		case apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member,apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(displayContainer,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//==============================
// serialization
//==============================

apogeeapp.app.JsonTableComponent.prototype.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.JsonTableComponent.prototype.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.setDataView(json.dataView);
    }
}

//======================================
// properties
//======================================

/** This returns the current values for the member and component properties in the  
 * proeprties dialog. */
apogeeapp.app.JsonTableComponent.prototype.readExtendedProperties = function(values) {
    values.dataView = this.getDataView();
}

//======================================
// Static methods
//======================================

/** This method takes input Property values and create a member json to create the member object.
 * Optionally a base member json can be passed in.
 */
apogeeapp.app.JsonTableComponent.createMemberJson = function(userInputValues,optionalBaseJson) {
    var json = apogeeapp.app.Component.createMemberJson(apogeeapp.app.JsonTableComponent,userInputValues,optionalBaseJson);
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

/** This is the display name for the type of component */
apogeeapp.app.JsonTableComponent.displayName = "Data Table";
/** This is the univeral uniaue name for the component, used to deserialize the component. */
apogeeapp.app.JsonTableComponent.uniqueName = "apogeeapp.app.JsonTableComponent";
apogeeapp.app.JsonTableComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.JsonTableComponent.DEFAULT_HEIGHT = 300;
/** This is the icon url for the component. */
apogeeapp.app.JsonTableComponent.ICON_RES_PATH = "/componentIcons/dataTable.png";
/** This field gives the default value for the JSON taht should be deserialized to
 * create the member for this object. The field "name" can be omitted. This will 
 * be added when the member is created. */
apogeeapp.app.JsonTableComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonTable"
};
/** This is configuration for the properties dialog box, the results of which
 * our code will read in. */
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
/** This optional static function reads property input from the property 
 * dialog and copies it into a member property json. It is not needed for
 * this componnet. */
//apogeeapp.app.JsonTableComponent.transferMemberProperties = function(inputValues,propertyJson) {
//}
/** This optional static function reads property input from the property 
 * dialog and copies it into a component property json. */
apogeeapp.app.JsonTableComponent.transferComponentProperties = function(inputValues,propertyJson) {
    if(inputValues.dataView !== undefined) {
        propertyJson.dataView = inputValues.dataView;
    }
}

