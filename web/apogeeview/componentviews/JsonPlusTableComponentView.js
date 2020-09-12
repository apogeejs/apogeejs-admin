import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";

export default class JsonPlusTableComponentView extends ComponentView {

    constructor(modelView,JsonPlusTableComponent) {
        super(modelView,JsonPlusTableComponent);
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return JsonPlusTableComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getModelView().getApp();
        
        
        //create the new view element;
        switch(viewType) {
            case JsonPlusTableComponentView.VIEW_DATA:
                dataDisplaySource = this.getDataSource();
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
                
            case JsonPlusTableComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member",DEFAULT_DATA_VALUE);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case JsonPlusTableComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member",DEFAULT_DATA_VALUE);
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            default:
    //temporary error handling...
                console.error("unrecognized view element: " + viewType);
                return null;
        }
    }

    
    /** This data source is read only (no edit). It returns text for a json */
    getDataSource() {

        return {
            doUpdate: () => {
                //return value is whether or not the data display needs to be udpated
                let component = this.getComponent();
                let reloadData = component.isMemberDataUpdated("member");
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            },

            getData: () => {
                let member = this.getComponent().getMember();
                let jsonPlus = member.getData();

                var textData;
                if(jsonPlus == apogeeutil.INVALID_VALUE) {
                    //for invalid input, convert to display an empty string
                    textData = "";
                }
                else if(jsonPlus === null) {
                    textData = "null";
                }
                else if(jsonPlus === undefined) {
                    textData = "undefined";
                }
                else {
                    let modifiedValueJson = replaceFunctions(jsonPlus);
                    textData = JSON.stringify(modifiedValueJson,null,FORMAT_STRING);
                }

                return textData;
            }
        }
    }


}


const FORMAT_STRING = "\t";

/** The following functions update a json with functions to be a plain json, with a
 * replacement string for any functions. (It is pretty inefficient.) */

const FUNCTION_REPLACEMENT_STRING = "[**FUNCTION**]";

function replaceFunctions(jsonPlus) {
    var copiedJson;

    var objectType = apogeeutil.getObjectType(jsonPlus);
    
    switch(objectType) {
        case "Object":
            copiedJson = replaceFunctionInObject(jsonPlus);
            break;
            
        case "Array": 
            copiedJson = replaceFunctionsInArray(jsonPlus);
            break;

        case "Function": 
            //copiedJson = FUNCTION_REPLACEMENT_STRING;
            copiedJson = jsonPlus.toString();
            break;
            
        default:
            copiedJson = jsonPlus;
    }
    
    return copiedJson;
}

function replaceFunctionInObject(jsonPlus) {
    var copiedJson = {};
    for(let key in jsonPlus) {
        copiedJson[key] = replaceFunctions(jsonPlus[key]);
    }
    return copiedJson;
}

function replaceFunctionsInArray(jsonPlus) {
    var copiedJson = [];
    for(var i = 0; i < jsonPlus.length; i++) {
        var element = jsonPlus[i];
        copiedJson.push(apogeeutil.getNormalizedCopy(element));
    }
    return copiedJson;
}

/** This is used as the default data value if we clear the code. It really should be a function of the data view,
 * since in grid mode this is an invalid value. Support for that shold be added. */
let DEFAULT_DATA_VALUE = "";

//===============================
// Internal Settings
//===============================

JsonPlusTableComponentView.VIEW_DATA = "Data";
JsonPlusTableComponentView.VIEW_CODE = "Formula";
JsonPlusTableComponentView.VIEW_SUPPLEMENTAL_CODE = "Private";

JsonPlusTableComponentView.VIEW_MODES = [
    JsonPlusTableComponentView.VIEW_DATA,
    JsonPlusTableComponentView.VIEW_CODE,
    JsonPlusTableComponentView.VIEW_SUPPLEMENTAL_CODE
];

JsonPlusTableComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": JsonPlusTableComponentView.VIEW_MODES,
    "defaultView": JsonPlusTableComponentView.VIEW_DATA,
    "emptyDataValue": ""
}

//===============================
// External Settings
//===============================

/** This is the component name with which this view is associated. */
JsonPlusTableComponentView.componentName = "apogeeapp.ExtendedJsonCell";

/** If true, this indicates the component has a tab entry */
JsonPlusTableComponentView.hasTabEntry = false;
/** If true, this indicates the component has an entry appearing on the parent tab */
JsonPlusTableComponentView.hasChildEntry = true;
/** This is the icon url for the component. */
JsonPlusTableComponentView.ICON_RES_PATH = "/icons3/jsonCellIcon.png";
/** This field gives the default value for the JSON taht should be deserialized to
 * create the member for this object. The field "name" can be omitted. This will 
 * be added when the member is created. */

