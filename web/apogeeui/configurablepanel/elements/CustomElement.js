import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";

/** This is a custom configurable element.
 * It elementInfoData should contain the entries:
 * - type - this should be the value "custom"
 * - key - this is the standard element key
 * - builderFunction - this is a function that takes the instance as an argument. it should be used to add
 * or override any functions to the instance.
 * 
 * @class 
 */
export default class CustomElement extends ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        elementInitData.builderFunction(this);
    }

}

CustomElement.TYPE_NAME = "custom";