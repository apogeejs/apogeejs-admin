import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import StandardErrorDisplay from "/apogeeview/datadisplay/StandardErrorDisplay.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";

/** This component represents a table object. */
export default class FunctionComponentView extends ComponentView {

    constructor(appViewInterface,functionComponent) {
        //extend edit component
        super(appViewInterface,functionComponent);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return FunctionComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        
        var dataDisplaySource;
        var app = this.getApp();
        
        //create the new view element;
        switch(viewType) {
                
            case FunctionComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case FunctionComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member");
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

}


FunctionComponentView.VIEW_CODE = "Code";
FunctionComponentView.VIEW_SUPPLEMENTAL_CODE = "Private";

FunctionComponentView.VIEW_MODES = [
    ComponentView.VIEW_INFO_MODE_ENTRY,
    {
        name: FunctionComponentView.VIEW_CODE,
        label: "Code",
        sourceLayer: "model",
        sourceType: "function",
        isActive: true
    },
    {
        name: FunctionComponentView.VIEW_SUPPLEMENTAL_CODE,
        label: "Private",
        sourceLayer: "model",
        sourceType: "private code",
        isActive: false
    },
];

FunctionComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": FunctionComponentView.VIEW_MODES
}


//======================================
// This is the component generator, to register the component
//======================================

FunctionComponentView.componentName = "apogeeapp.FunctionCell";
FunctionComponentView.hasTabEntry = false;
FunctionComponentView.hasChildEntry = true;
FunctionComponentView.ICON_RES_PATH = "/icons3/functionCellIcon.png";

FunctionComponentView.propertyDialogLines = [
    {
        "type":"textField",
        "label":"Arg List: ",
        "size": 80,
        "key":"argListString"
    }
];

