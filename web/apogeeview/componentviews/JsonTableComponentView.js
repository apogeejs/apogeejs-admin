import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import HandsonGridEditor from "/apogeeview/datadisplay/HandsonGridEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";

export default class JsonTableComponentView extends ComponentView {

    constructor(modelView,jsonTableComponent) {
        super(modelView,jsonTableComponent);
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return JsonTableComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getModelView().getApp();
        
        
        //create the new view element;
        switch(viewType) {
            case JsonTableComponentView.VIEW_DATA:
                var component = this.getComponent();
                let dataView = component.getField("dataView");
                switch(dataView) {
                    case JsonTableComponentView.COLORIZED_DATA_VEW:
                    default:
                        dataDisplaySource = this._wrapSourceForViewChange(dataDisplayHelper.getMemberDataTextDataSource(app,this,"member"));
                        return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
                        
                    case JsonTableComponentView.TEXT_DATA_VEW:
                        dataDisplaySource = this._wrapSourceForViewChange(dataDisplayHelper.getMemberDataJsonDataSource(app,this,"member"));
                        return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/text",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                        
                    case JsonTableComponentView.GRID_DATA_VEW:
                        dataDisplaySource = this._wrapSourceForViewChange(dataDisplayHelper.getMemberDataJsonDataSource(app,this,"member"));
                        return new HandsonGridEditor(displayContainer,dataDisplaySource);
                        
                    // case JsonTableComponentView.PLAIN_DATA_VEW:
                    // default:
                    //     callbacks = dataDisplayHelper.getMemberDataTextCallbacks(app,this.member);
                    //     return new AceTextEditor(displayContainer,callbacks,"ace/mode/text",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                }
                
            case JsonTableComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case JsonTableComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    /** This method updated the data display source to account for reloading the data display due to 
     * a change in the data view. */
    _wrapSourceForViewChange(dataDisplaySource) {
        let originalDoUpdate = dataDisplaySource.doUpdate;
        dataDisplaySource.doUpdate = () => {
            let returnValue = originalDoUpdate();
            returnValue.reloadDataDisplay = this.getComponent().isFieldUpdated("dataView");
            return returnValue;
        }
        return dataDisplaySource;
    }


}

//===============================
// Internal Settings
//===============================

JsonTableComponentView.VIEW_DATA = "Data";
JsonTableComponentView.VIEW_CODE = "Formula";
JsonTableComponentView.VIEW_SUPPLEMENTAL_CODE = "Private";

JsonTableComponentView.VIEW_MODES = [
    JsonTableComponentView.VIEW_DATA,
    JsonTableComponentView.VIEW_CODE,
    JsonTableComponentView.VIEW_SUPPLEMENTAL_CODE
];

JsonTableComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": JsonTableComponentView.VIEW_MODES,
    "defaultView": JsonTableComponentView.VIEW_DATA,
    "emptyDataValue": ""
}

JsonTableComponentView.COLORIZED_DATA_VEW = "Colorized";
JsonTableComponentView.TEXT_DATA_VEW = "Text Data";
JsonTableComponentView.GRID_DATA_VEW = "Grid";
JsonTableComponentView.PLAIN_DATA_VEW = "Plain"; 

JsonTableComponentView.DEFAULT_DATA_VIEW = JsonTableComponentView.COLORIZED_DATA_VEW;

//===============================
// External Settings
//===============================

/** This is the component name with which this view is associated. */
JsonTableComponentView.componentName = "apogeeapp.JsonCell";

/** If true, this indicates the component has a tab entry */
JsonTableComponentView.hasTabEntry = false;
/** If true, this indicates the component has an entry appearing on the parent tab */
JsonTableComponentView.hasChildEntry = true;
/** This is the icon url for the component. */
JsonTableComponentView.ICON_RES_PATH = "/componentIcons/dataTable.png";
/** This field gives the default value for the JSON taht should be deserialized to
 * create the member for this object. The field "name" can be omitted. This will 
 * be added when the member is created. */

 /** This is configuration for the properties dialog box, the results of which
 * our code will read in. */
JsonTableComponentView.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Data View: ",
        "entries":[
            "Colorized",
//            "Plain",
            "Text Data",
            "Grid"
        ],
        "resultKey":"dataView"
    }
];


