import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import ErrorDisplay from "/apogeeview/datadisplay/ErrorDisplay.js";

/** This component represents a json table object. */
export default class ErrorComponentView extends ComponentView {

    constructor(modelView,component) {
        //extend edit component
        super(modelView,component);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return ErrorComponentView.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a view mode of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        return new ErrorDisplay(displayContainer,false);
    }

    //======================================
    // Static methods
    //======================================

}

ErrorComponentView.EMPTY_VIEW = "EMPTY_VIEW";

ErrorComponentView.VIEW_MODES = [
    ErrorComponentView.EMPTY_VIEW
];

ErrorComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": ErrorComponentView.VIEW_MODES,
    "emptyDataValue": ""
}

//======================================
// This is the component generator, to register the component
//======================================

ErrorComponentView.componentName = "apogeeapp.ErrorCell";
ErrorComponentView.hasTabEntry = false;
ErrorComponentView.hasChildEntry = true;
ErrorComponentView.ICON_RES_PATH = "/icons3/errorCellIcon.png";

