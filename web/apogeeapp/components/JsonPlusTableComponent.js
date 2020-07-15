import Component from "/apogeeapp/component/Component.js";

/** This component is similar to the JsonTableComponent except that it
 * also supports function elements. When displaying them it replaces the function
 * element with the string value for that function.
 * This component only allows the standard JSON view and it also does not support manually
 * editing the value. The value must be returned from the formula.
 * This implementation is also inefficient. It is not intended for large data objects.
 */
export default class JsonPlusTableComponent extends Component {
    
        
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //extend edit component
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    };
}

//======================================
// This is the component generator, to register the component
//======================================


/** This is the display name for the type of component */
JsonPlusTableComponent.displayName = "Extended Data Cell";
/** This is the univeral uniaue name for the component, used to deserialize the component. */
JsonPlusTableComponent.uniqueName = "apogeeapp.ExtendedJsonCell";

JsonPlusTableComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonMember"
};
