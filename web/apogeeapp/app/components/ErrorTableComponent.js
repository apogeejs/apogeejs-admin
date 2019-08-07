import Component from "/apogeeapp/app/component/Component.js";
import EditComponent from "/apogeeapp/app/component/EditComponent.js";
import ErrorDisplay from "/apogeeapp/app/datadisplay/ErrorDisplay.js";

/** This component represents a json table object. */
export default class ErrorTableComponent extends EditComponent {

    constructor(workspaceUI,table) {
        //extend edit component
        super(workspaceUI,table,ErrorTableComponent);

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

    static createMemberJson(userInputValues,optionalBaseJson) {
        var json = Component.createMemberJson(ErrorTableComponent,userInputValues,optionalBaseJson);
        return json;
    }

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
ErrorTableComponent.DEFAULT_WIDTH = 300;
ErrorTableComponent.DEFAULT_HEIGHT = 100;
ErrorTableComponent.ICON_RES_PATH = "/componentIcons/genericDataTable.png";
ErrorTableComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.ErrorTable"
};

