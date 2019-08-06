import Component from "/apogeeapp/app/component/Component.js";
import EditComponent from "/apogeeapp/app/component/EditComponent.js";

/** This component represents a json table object. */
export default class JsonTableComponent extends EditComponent {
    
        
    constructor(workspaceUI,table) {
        //extend edit component
        super(workspaceUI,table,JsonTableComponent);

        //default view
        this.dataView = JsonTableComponent.DEFAULT_DATA_VIEW;
    };

    getDataView() {
        if(!this.dataView) this.dataView = JsonTableComponent.DEFAULT_DATA_VIEW;
        return this.dataView;
    }

    setDataView(dataView) {
        if(this.dataView != dataView) {
            this.fieldUpdated("dataView");
            
            this.dataView = dataView;
            //update the window display if needed
            var componentDisplay = this.getComponentDisplay();
            if(componentDisplay) {
                alert("I need to fix set data view in json table!");
                //componentDisplay.updateViewModeElement(JsonTableComponent.VIEW_DATA);
            }
        }
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return JsonTableComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var callbacks;
        
        //create the new view element;
        switch(viewType) {
            case JsonTableComponent.VIEW_DATA:
                switch(this.dataView) {
                    case JsonTableComponent.COLORIZED_DATA_VEW:
                        callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                        return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/json");
                        
                    case JsonTableComponent.TEXT_DATA_VEW:
                        callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                        return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                        
                    case JsonTableComponent.GRID_DATA_VEW:
                        callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                        return new apogeeapp.app.HandsonGridEditor(displayContainer,callbacks);
                        
                    case JsonTableComponent.PLAIN_DATA_VEW:
                    default:
                        callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                        return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/text");
                }
                
            case JsonTableComponent.VIEW_CODE:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member,JsonTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
                return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member,JsonTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
                return new apogeeapp.app.AceTextEditor(displayContainer,callbacks,"ace/mode/javascript");
                
            case JsonTableComponent.VIEW_DESCRIPTION:
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

    writeToJson(json) {
        json.dataView = this.dataView;
    }

    readFromJson(json) {
        if(json.dataView !== undefined) {
            this.setDataView(json.dataView);
        }
    }

    //======================================
    // properties
    //======================================

    /** This returns the current values for the member and component properties in the  
     * proeprties dialog. */
    readExtendedProperties(values) {
        values.dataView = this.getDataView();
    }

    //======================================
    // Static methods
    //======================================

    /** This method takes input Property values and create a member json to create the member object.
     * Optionally a base member json can be passed in.
     */
    static createMemberJson(userInputValues,optionalBaseJson) {
        var json = Component.createMemberJson(apogeeapp.app.JsonTableComponent,userInputValues,optionalBaseJson);
        return json;
    }

    /** This optional static function reads property input from the property 
     * dialog and copies it into a member property json. It is not needed for
     * this componnet. */
    //transferMemberProperties(inputValues,propertyJson) {
    //}

    /** This optional static function reads property input from the property 
     * dialog and copies it into a component property json. */
    static transferComponentProperties(inputValues,propertyJson) {
        if(inputValues.dataView !== undefined) {
            propertyJson.dataView = inputValues.dataView;
        }
    }
}


JsonTableComponent.VIEW_DATA = "Data";
JsonTableComponent.VIEW_CODE = "Formula";
JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
JsonTableComponent.VIEW_DESCRIPTION = "Notes";

JsonTableComponent.VIEW_MODES = [
    JsonTableComponent.VIEW_DATA,
    JsonTableComponent.VIEW_CODE,
    JsonTableComponent.VIEW_SUPPLEMENTAL_CODE,
    JsonTableComponent.VIEW_DESCRIPTION
];

JsonTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": JsonTableComponent.VIEW_MODES,
    "defaultView": JsonTableComponent.VIEW_DATA,
    "emptyDataValue": ""
}

JsonTableComponent.PLAIN_DATA_VEW = "Plain";
JsonTableComponent.COLORIZED_DATA_VEW = "Colorized";
JsonTableComponent.TEXT_DATA_VEW = "Text Data";
JsonTableComponent.GRID_DATA_VEW = "Grid";

JsonTableComponent.DEFAULT_DATA_VIEW = JsonTableComponent.COLORIZED_DATA_VEW;

//======================================
// This is the component generator, to register the component
//======================================


/** This is the display name for the type of component */
JsonTableComponent.displayName = "Data Table";
/** This is the univeral uniaue name for the component, used to deserialize the component. */
JsonTableComponent.uniqueName = "apogeeapp.app.JsonTableComponent";
JsonTableComponent.DEFAULT_WIDTH = 300;
JsonTableComponent.DEFAULT_HEIGHT = 300;
/** This is the icon url for the component. */
JsonTableComponent.ICON_RES_PATH = "/componentIcons/dataTable.png";
/** This field gives the default value for the JSON taht should be deserialized to
 * create the member for this object. The field "name" can be omitted. This will 
 * be added when the member is created. */
JsonTableComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonTable"
};
/** This is configuration for the properties dialog box, the results of which
 * our code will read in. */
JsonTableComponent.propertyDialogLines = [
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


