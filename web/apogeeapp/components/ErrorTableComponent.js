import Component from "/apogeeapp/component/Component.js";
import EditComponent from "/apogeeapp/component/EditComponent.js";
import ErrorDisplay from "/apogeeview/datadisplay/ErrorDisplay.js";

/** This component represents a json table object. */
export default class ErrorTableComponent extends EditComponent {

    constructor(modelManager,table) {
        //extend edit component
        super(modelManager,table,ErrorTableComponent);

        //default view
        this.dataView = ErrorTableComponent.EMPTY_VIEW;
    };


    getDataView() {
        return this.dataView;
    }

    setDataView(dataView) {
        //no action - data view is fixed
    }

    //==============================
    // Protected and Private Instance Methods
    //==============================



    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return ErrorTableComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a view mode of the give type. 
     * @protected. */
    getDataDisplay(displayContainer,viewType) {
        return new ErrorDisplay(displayContainer,false);
    }

    /** This overrides the save method to return the original input. */
    toJson() {
        return this.completeJson;
    }

    /** This overrides the open deserialize method to save the entire json. */
    loadPropertyValues(json) {
        this.completeJson = json;
    }

    //======================================
    // Static methods
    //======================================

}

ErrorTableComponent.EMPTY_VIEW = "EMPTY_VIEW";

ErrorTableComponent.VIEW_MODES = [
    ErrorTableComponent.EMPTY_VIEW
];

ErrorTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": ErrorTableComponent.VIEW_MODES,
    "defaultView": ErrorTableComponent.EMPTY_VIEW,
    "emptyDataValue": ""
}

//======================================
// This is the component generator, to register the component
//======================================

ErrorTableComponent.displayName = "Error Table";
ErrorTableComponent.uniqueName = "apogeeapp.app.ErrorTableComponent";
ErrorTableComponent.hasTabEntry = false;
ErrorTableComponent.hasChildEntry = true;
ErrorTableComponent.ICON_RES_PATH = "/componentIcons/genericDataTable.png";
ErrorTableComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.ErrorTable"
};

