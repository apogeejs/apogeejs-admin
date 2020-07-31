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
        this.childConfigurableElements = [];
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

    /** This returns a list of ConfigurableElements inside this layout container.  */
    getChildElementObjects() {
        return this.childConfigurableElements;
    }

    /** This is used to determine what type of child element this is for a panel. */
    get elementType() {
        return "ConfigurableLayoutContainer";
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
        var elementObject = ConfigurablePanel.instantiateConfigurableType(this.getForm(),elementInitData);

        //add the dom element for the child element
        this.insertElement(elementObject,elementInitData);

        //add the child configurable elements to the list
        if(elementObject instanceof ConfigurableElement) {
            //add this element to the child element list
            this.childConfigurableElements.push(elementObject);
        }
        else if(elementObject instanceof ConfigurableLayoutContainer) {
            //add all child elements from this container to the child element list
            this.childConfigurableElements.push(...elementObject.getChildElementObjects());
        }
        else {
            throw new Error("Unknown form item class: " + typeof elementObject);
        } 
    }
      
}


