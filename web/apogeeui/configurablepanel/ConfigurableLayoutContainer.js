import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import ConfigurablePanel from "/apogeeui/configurablepanel/ConfigurablePanel.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is a item that can be placed inside a panel container. In the initialization config it has child
 * configurable elements (and configurable layout containers), however any child configurable element is included as a
 * value in the parent panel. The configurable layout containers just holds to organize the DOM elements from its 
 * children.
 * 
 * @class 
 */
export default class ConfigurableLayoutContainer {
    constructor(form) {
        this.form = form;
        this.domElement = uiutil.createElement("div",{"className":ConfigurableElement.CONTAINER_CLASS});
        //udpate padding and margin to 0
        this.domElement.style.margin = ConfigurableElement.ELEMENT_MARGIN_NONE;
        this.domElement.style.padding = ConfigurableElement.ELEMENT_PADDING_NONE;
    }

    /** This method returns the DOM element for this layout container. */
    getElement() {
        return this.domElement;
    }
    
    /** This method returns the parent form for this configurable element. */
    getForm() {
        return this.form;
    }

    /** This is used to determine what type of child element this is for a panel. */
    get elementType() {
        return "ConfigurableLayoutContainer";
    }

    /** This function should be used to set the display state for the element, since that variable
     * is also used to control visibility. */
    setVisibleDisplayStyle(visibleDisplayStyle) {
        this.visibleDisplayStyle = visibleDisplayStyle;
        if(this.domElement.style.display != "none") {
            this.domElement.style.display = this.visibleDisplayStyle;
        }
    }

    //==================================
    //protected methods
    //==================================

    /** This method intializes the container */
    //initializeContainer(containerInitData);

    /** This method adds the element to the container. */
    //insertElement(elementObject,elementInitData));

    /** this is called internally to add an element to the panel. */
    addToContainer(elementInitData) {
        var elementObject = ConfigurablePanel.instantiateConfigurableType(this.form,elementInitData);

        //add the dom element for the child element
        this.insertElement(elementObject,elementInitData);

        //add the child configurable elements to the list
        if(elementObject instanceof ConfigurableElement) {
            //pass the element object to the form
            this.form.insertChildElement(elementObject);
        }
        // else if(elementObject instanceof ConfigurableLayoutContainer) {
        // }
        // else {
        //     throw new Error("Unknown form item class: " + typeof elementObject);
        // } 
    }
      
}


