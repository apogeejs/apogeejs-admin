import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class InvisibleElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        //we will hide this element by setting display none. Someone can go ahead 
        //and show it, in which case they will get an empty element with margins.
        //maybe we should have a way to not create the element in the first place.
        super(form,elementInitData,ConfigurableElement.CONTAINER_CLASS_INVISIBLE);
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.value;
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.value = value;
    }
}

InvisibleElement.TYPE_NAME = "invisible";


