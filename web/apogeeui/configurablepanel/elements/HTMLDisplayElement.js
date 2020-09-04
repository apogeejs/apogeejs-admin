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

        this._postInstantiateInit(elementInitData);
    }

}

HTMLDisplayElement.TYPE_NAME = "htmlDisplay";




