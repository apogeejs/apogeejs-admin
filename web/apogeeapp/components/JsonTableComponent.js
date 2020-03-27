import Component from "/apogeeapp/component/Component.js";

/** This component represents a json table object. */
export default class JsonTableComponent extends Component {
    
        
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //extend edit component
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //default view
            this.setField("dataView",JsonTableComponent.DEFAULT_DATA_VIEW);
        }
    };

    getDataView() {
        let dataView = this.getField("dataView");
        if(!dataView) dataView = JsonTableComponent.DEFAULT_DATA_VIEW;
        return dataView;
    }

    setDataView(dataView) {
        let oldDataView = this.getField("dataView");
        if(oldDataView != dataView) {
            this.setField("dataView",dataView);
        }
    }

    //==============================
    // serialization
    //==============================

    writeToJson(json,modelManager) {
        json.dataView = this.getDataView();
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
