import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";

/** This component represents a table object. */
export default class FunctionComponentView extends ComponentView {

    constructor(modelView,functionComponent) {
        //extend edit component
        super(modelView,functionComponent);
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
        var app = this.getModelView().getApp();
        
        //create the new view element;
        switch(viewType) {
                
            case FunctionComponentView.VIEW_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            case FunctionComponentView.VIEW_SUPPLEMENTAL_CODE:
                dataDisplaySource = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);
                
            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

}


FunctionComponentView.VIEW_CODE = "Code";
FunctionComponentView.VIEW_SUPPLEMENTAL_CODE = "Private";

FunctionComponentView.VIEW_MODES = [
    FunctionComponentView.VIEW_CODE,
    FunctionComponentView.VIEW_SUPPLEMENTAL_CODE
];

FunctionComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": FunctionComponentView.VIEW_MODES,
    "defaultView": FunctionComponentView.VIEW_CODE
}


//======================================
// This is the component generator, to register the component
//======================================

FunctionComponentView.componentName = "apogeeapp.FunctionCell";
FunctionComponentView.hasTabEntry = false;
FunctionComponentView.hasChildEntry = true;
FunctionComponentView.ICON_RES_PATH = "/componentIcons/functionTable.png";

FunctionComponentView.propertyDialogLines = [
    {
        "type":"textField",
        "label":"Arg List: ",
        "key":"argListString"
    }
];

