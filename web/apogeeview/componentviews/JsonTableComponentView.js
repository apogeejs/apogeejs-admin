import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import HandsonGridEditor from "/apogeeview/datadisplay/HandsonGridEditor.js";
import StandardErrorDisplay from "/apogeeview/datadisplay/StandardErrorDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";

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
        var app = this.getApp();
        
        //create the new view element;
        switch(viewType) {
            case JsonTableComponentView.VIEW_DATA:
                var component = this.getComponent();
                let dataView = component.getField("dataView");
                //update the display container state bar
                this._setDisplayContainerStatus(displayContainer,dataView);
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
                }
                
            case JsonTableComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member",DEFAULT_DATA_VALUE);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case JsonTableComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member",DEFAULT_DATA_VALUE);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            case ComponentView.VIEW_INFO: 
                dataDisplaySource = dataDisplayHelper.getStandardErrorDataSource(app,this);
                return new StandardErrorDisplay(displayContainer,dataDisplaySource);
                
            default:
    //temporary error handling...
                console.error("unrecognized view element: " + viewType);
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

    _setDisplayContainerStatus(displayContainer,dataView) {
        let displayBarElement = displayContainer.getDisplayBarElement();
        if(displayBarElement) {
            uiutil.removeAllChildren(displayBarElement);
            let statusElement = document.createElement("span");
            statusElement.innerHTML = "Display Format: " + VIEW_DISPLAY_NAMES[dataView];
            statusElement.style.fontSize = "smaller";
            statusElement.style.color = "gray";
            statusElement.style.marginLeft = "20px";
            statusElement.style.userSelect ; "none";
            statusElement.className = "visiui_hideSelection";
            displayBarElement.appendChild(statusElement);
        }
    }
}

/** This is used as the default data value if we clear the code. It really should be a function of the data view,
 * since in grid mode this is an invalid value. Support for that shold be added. */
let DEFAULT_DATA_VALUE = "";

//===============================
// Internal Settings
//===============================

JsonTableComponentView.VIEW_DATA = "Data";
JsonTableComponentView.VIEW_CODE = "Formula";
JsonTableComponentView.VIEW_SUPPLEMENTAL_CODE = "Private";

JsonTableComponentView.VIEW_MODES = [
    ComponentView.VIEW_INFO_MODE_ENTRY,
    {
        name: JsonTableComponentView.VIEW_DATA,
        label: "Data",
        sourceLayer: "model",
        sourceType: "data",
        isActive: true
    },
    {
        name: JsonTableComponentView.VIEW_CODE,
        label: "Formula",
        sourceLayer: "model",
        sourceType: "function",
        isActive: false
    },
    {
        name: JsonTableComponentView.VIEW_SUPPLEMENTAL_CODE,
        label: "Private",
        sourceLayer: "model",
        sourceType: "private code",
        isActive: false
    }   
];

JsonTableComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": JsonTableComponentView.VIEW_MODES,
    "emptyDataValue": ""
}

JsonTableComponentView.COLORIZED_DATA_VEW = "Colorized";
JsonTableComponentView.TEXT_DATA_VEW = "Text Data";
JsonTableComponentView.GRID_DATA_VEW = "Grid";

JsonTableComponentView.DEFAULT_DATA_VIEW = JsonTableComponentView.COLORIZED_DATA_VEW;

let VIEW_DISPLAY_NAMES = {};
VIEW_DISPLAY_NAMES[JsonTableComponentView.COLORIZED_DATA_VEW] = "JSON";
VIEW_DISPLAY_NAMES[JsonTableComponentView.TEXT_DATA_VEW] = "Plain Text";
VIEW_DISPLAY_NAMES[JsonTableComponentView.GRID_DATA_VEW] = "Grid";

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
JsonTableComponentView.ICON_RES_PATH = "/icons3/jsonCellIcon.png";
/** This field gives the default value for the JSON taht should be deserialized to
 * create the member for this object. The field "name" can be omitted. This will 
 * be added when the member is created. */

 /** This is configuration for the properties dialog box, the results of which
 * our code will read in. */
JsonTableComponentView.propertyDialogLines = [
    {
        "type":"dropdown",
        "label":"Data Display Format: ",
        "entries":[
            [ VIEW_DISPLAY_NAMES[JsonTableComponentView.COLORIZED_DATA_VEW] , JsonTableComponentView.COLORIZED_DATA_VEW ],
            [ VIEW_DISPLAY_NAMES[JsonTableComponentView.TEXT_DATA_VEW] , JsonTableComponentView.TEXT_DATA_VEW ],
            [ VIEW_DISPLAY_NAMES[JsonTableComponentView.GRID_DATA_VEW] , JsonTableComponentView.GRID_DATA_VEW ]
        ],
        "key":"dataView"
    }
];


