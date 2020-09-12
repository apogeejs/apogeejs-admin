import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeeview/datadisplay/dataDisplayHelper.js";

/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
export default class BasicComponentView extends ComponentView {

    constructor(modelView,component) {
        //extend edit component
        super(modelView,component);
    };

    //==============================
    // Methods to Implement
    //==============================

    //This method must be implemented
    ///** This method returns the outout data display/editor for the control */
    //getOutputDisplay(displayContainer);

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return BasicComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {

        var callbacks;
        var app = this.getModelView().getApp();

        //create the new view element;
        switch(viewType) {

            case BasicComponentView.VIEW_OUTPUT:
                return this.getOutputDisplay(displayContainer);

            case BasicComponentView.VIEW_CODE:
                callbacks = dataDisplayHelper.getMemberFunctionBodyDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            case BasicComponentView.VIEW_SUPPLEMENTAL_CODE:
                callbacks = dataDisplayHelper.getMemberSupplementalDataSource(app,this,"member");
                return new AceTextEditor(displayContainer,callbacks,"ace/mode/javascript",AceTextEditor.OPTION_SET_DISPLAY_MAX);

            default:
    //temporary error handling...
                console.error("unrecognized view element: " + viewType);
                return null;
        }
    }
}

//======================================
// Static properties
//======================================

BasicComponentView.VIEW_OUTPUT = "Output";
BasicComponentView.VIEW_CODE = "Code";
BasicComponentView.VIEW_SUPPLEMENTAL_CODE = "Private";

BasicComponentView.VIEW_MODES = [
	BasicComponentView.VIEW_OUTPUT,
	BasicComponentView.VIEW_CODE,
    BasicComponentView.VIEW_SUPPLEMENTAL_CODE
];

BasicComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": BasicComponentView.VIEW_MODES,
    "defaultView": BasicComponentView.VIEW_OUTPUT
}

//===============================
// External Settings
//===============================

/** This is the component name with which this view is associated. */
//BasicControlComponentView.componentName = "<insert component unique name here>";

/** If true, this indicates the component has a tab entry */
BasicComponentView.hasTabEntry = false;
/** If true, this indicates the component has an entry appearing on the parent tab */
BasicComponentView.hasChildEntry = true;

/** This is the icon url for the component. */
BasicComponentView.ICON_RES_PATH = "/componentIcons/genericControl.png";







