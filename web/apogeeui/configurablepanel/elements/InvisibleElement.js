import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";

/** This element holds a value that can only be set during configuration. The element is not 
 * visible on the form.
 * 
 * @class 
 */
export default class InvisibleElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        //we will hide this element by setting display none. Someone can go ahead 
        //and show it, in which case they will get an empty element with margins.
        //maybe we should have a way to not create the element in the first place.
        super(form,elementInitData);

        //we set the element value here in initialization and do not allow it to be set
        //elsewhere. We disabled the setValue method.
        this.value = elementInitData.value;

        //update the class to be invisible
        this.setVisibleDisplayStyle(ConfigurableElement.ELEMENT_DISPLAY_INVISIBLE);
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.value;
    }   

    //===================================
    // protected Methods
    //==================================

    /** This does NOT update the value. The value is only set in initialization. */
    setValueImpl(value) {
        //no action!
    }
}

InvisibleElement.TYPE_NAME = "invisible";


