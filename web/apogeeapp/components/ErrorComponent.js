import Component from "/apogeeapp/component/Component.js";

/** This component represents a json table object. */
export default class ErrorComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //extend edit component
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    };

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /** This overrides the save method to return the original input. */
    toJson(modelManager) {
        return this.getField("completeJson");
    }

    /** This overrides the open deserialize method to save the entire json. */
    loadStoredData(json) {
        this.setField("completeJson",json);
    }

    //======================================
    // Static methods
    //======================================

}

//======================================
// This is the component generator, to register the component
//======================================

ErrorComponent.displayName = "Error Cell";
ErrorComponent.uniqueName = "apogeeapp.ErrorCell";
ErrorComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.ErrorMember"
};

