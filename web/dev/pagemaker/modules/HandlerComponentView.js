//These are in lieue of the import statements
let getComponentViewClass = apogeeview.getComponentViewClass;

let FunctionComponentViewClass = getComponentViewClass("apogeeapp.app.FunctionComponent");

/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
export default class HandlerComponentView extends FunctionComponentViewClass {

    constructor(modelView,component) {
        super(modelView,component);

        //get the parent component
        //for now we will not allow these to update
        this.handlerName = component.getName();
        this.elementId = component.getParentComponent(modelView.getModelManager()).getName();
        this.htmlElement = document.getElementById(this.elementId);

        this.componentUpdated(component);
    };

    componentUpdated(component) {
        super.componentUpdated(component);
        
        if(this.htmlElement) {
            //update element if data changes
            if(component.isMemberDataUpdated("member")) {
                //set the property
                let member = component.getMember();
                this.htmlElement[this.handlerName] = member.getData();
            }
        }

    }
}

//======================================
// Static properties
//======================================

/** This is the component name with which this view is associated. */
HandlerComponentView.componentName = "pagerunner.HandlerComponent";

/** This is the icon url for the component. */
HandlerComponentView.ICON_RES_PATH = "/componentIcons/formControl.png";
