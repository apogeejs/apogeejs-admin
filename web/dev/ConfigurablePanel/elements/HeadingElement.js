/** This is a heading element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.HeadingElement = class extends apogeeapp.ui.ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        var headingLevel;
        if(elementInitData.level) { 
            headingLevel = elementInitData.level;
        }
        else {
            headingLevel = apogeeapp.ui.HeadingElement.DEFAULT_HEADING_LEVEL;
        }
        var headingType = "h" + headingLevel;
        
        this.headingElement = apogeeapp.ui.createElement(headingType,{"className":"apogee_configurablePanelHeading","innerHTML":elementInitData.text});
        containerElement.appendChild(this.headingElement);
    }

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action;
    }
}


apogeeapp.ui.HeadingElement.DEFAULT_HEADING_LEVEL = 2;

apogeeapp.ui.HeadingElement.TYPE_NAME = "heading";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.HeadingElement.TYPE_NAME,apogeeapp.ui.HeadingElement);


