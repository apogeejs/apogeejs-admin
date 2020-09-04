import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is a heading element configurable element.
 * 
 * @class 
 */
export default class HeadingElement extends ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        var headingLevel;
        if(elementInitData.level) { 
            headingLevel = elementInitData.level;
        }
        else {
            headingLevel = HeadingElement.DEFAULT_HEADING_LEVEL;
        }
        var headingClass = "apogee_configurablePanelHeading_" + headingLevel;
        
        let headingElement = uiutil.createElement("span",{"className":headingClass,"innerHTML":elementInitData.text});
        containerElement.appendChild(headingElement);

        this._postInstantiateInit(elementInitData);
    }
}


HeadingElement.DEFAULT_HEADING_LEVEL = 2;

HeadingElement.TYPE_NAME = "heading";





