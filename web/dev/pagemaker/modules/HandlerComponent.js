//These are in lieue of the import statements
let componentInfo = apogeeapp.componentInfo;

let FunctionComponentClass = componentInfo.getComponentClass("apogeeapp.FunctionCell");

/** This is a simple custom component example. */
export default class HandlerComponent extends FunctionComponentClass {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

/** This is the display name for the type of component */
HandlerComponent.displayName = "PageRunner Handler Component";

/** This is the univeral unique name for the component, used to deserialize the component. */
HandlerComponent.uniqueName = "pagerunner.HandlerComponent";
