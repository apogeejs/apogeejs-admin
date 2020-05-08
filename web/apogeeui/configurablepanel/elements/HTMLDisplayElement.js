import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";

/** This is a heading element configurable element.
 * 
 * @class 
 */
export default class HTMLDisplayElement extends ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        containerElement.innerHTML = elementInitData.html
    }

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action;
    }
}

HTMLDisplayElement.TYPE_NAME = "htmlDisplay";




