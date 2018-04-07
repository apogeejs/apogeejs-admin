/** This is a heading element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.HTMLDisplayElement = class extends apogeeapp.ui.ConfigurableElement {

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

apogeeapp.ui.HTMLDisplayElement.TYPE_NAME = "htmlDisplay";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.HTMLDisplayElement);


