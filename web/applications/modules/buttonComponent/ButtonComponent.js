import Component from "/apogeeapp/component/Component.js";

/** This is a simple custom component example. */
export default class ButtonComponent extends Component {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

/** This is the display name for the type of component */
ButtonComponent.displayName = "Button Component";

/** This is the univeral unique name for the component, used to deserialize the component. */
ButtonComponent.uniqueName = "apogeeapp.app.ButtonComponent";

/** This is the json needed to create the necessary members for the  component */
ButtonComponent.DEFAULT_MEMBER_JSON = {
     "type": "apogee.JsonMember"
};
