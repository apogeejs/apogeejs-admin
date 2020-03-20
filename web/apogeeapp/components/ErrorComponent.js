import Component from "/apogeeapp/component/Component.js";
import ErrorDisplay from "/apogeeview/datadisplay/ErrorDisplay.js";

/** This component represents a json table object. */
export default class ErrorComponent extends Component {

    constructor(member,modelManager) {
        //extend edit component
        super(member,modelManager);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /** This overrides the save method to return the original input. */
    toJson(modelManager) {
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

//======================================
// This is the component generator, to register the component
//======================================

ErrorComponent.displayName = "Error Table";
ErrorComponent.uniqueName = "apogeeapp.app.ErrorComponent";
ErrorComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.ErrorTable"
};

