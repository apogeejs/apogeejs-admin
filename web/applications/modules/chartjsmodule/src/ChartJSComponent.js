//These are in lieue of the import statements
let {Component} = apogeeapp;

/** This is a simple custom component example. */
export default class ChartJSComponent extends Component {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

/** This is the display name for the type of component */
ChartJSComponent.displayName = "Chart.js Cell";

/** This is the univeral unique name for the component, used to deserialize the component. */
ChartJSComponent.uniqueName = "apogeeapp.ChartJSCell";

/** This is the json needed to create the necessary members for the  component */
ChartJSComponent.DEFAULT_MEMBER_JSON = {
     "type": "apogee.JsonMember"
};
