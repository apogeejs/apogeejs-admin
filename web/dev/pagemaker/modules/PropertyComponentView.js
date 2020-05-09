//These are in lieue of the import statements
let getComponentViewClass = apogeeview.getComponentViewClass;

let JsonTableComponentViewClass = getComponentViewClass("apogeeapp.app.JsonTableComponent");

/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
export default class PropertyComponentView extends JsonTableComponentViewClass {

    constructor(modelView,component) {
        super(modelView,component);

        //get the parent component
        //for now we will not allow these to update
        this.propertyName = component.getName();
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
                this.htmlElement[this.propertyName] = member.getData();
            }
        }

    }
}

//======================================
// Static properties
//======================================

/** This is the component name with which this view is associated. */
PropertyComponentView.componentName = "pagerunner.PropertyComponent";

/** This is the icon url for the component. */
PropertyComponentView.ICON_RES_PATH = "/componentIcons/formControl.png";
