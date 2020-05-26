//These are in lieue of the import statements
let componentInfo = apogeeapp.componentInfo;

let JsonTableComponentClass = componentInfo.getComponentClass("apogeeapp.JsonCell");

/** This is a simple custom component example. */
export default class PropertyComponent extends JsonTableComponentClass {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

/** This is the display name for the type of component */
PropertyComponent.displayName = "PageRunner Property Component";

/** This is the univeral unique name for the component, used to deserialize the component. */
PropertyComponent.uniqueName = "pagerunner.PropertyComponent";
