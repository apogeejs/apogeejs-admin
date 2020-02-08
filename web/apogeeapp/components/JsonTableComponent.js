import Component from "/apogeeapp/component/Component.js";

/** This component represents a json table object. */
export default class JsonTableComponent extends Component {
    
        
    constructor(modelManager,table) {
        //extend edit component
        super(modelManager,table,JsonTableComponent);

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

//======================================
// This is the component generator, to register the component
//======================================


/** This is the display name for the type of component */
JsonTableComponent.displayName = "Data Table";
/** This is the univeral uniaue name for the component, used to deserialize the component. */
JsonTableComponent.uniqueName = "apogeeapp.app.JsonTableComponent";

JsonTableComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonTable"
};
