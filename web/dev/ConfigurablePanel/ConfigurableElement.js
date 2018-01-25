/** This is an element that composes the content of a configurable panel.
 * 
 * @class 
 */
apogeeapp.ui.ConfigurableElement = class {
    constructor(form,elementInitData,supressElement = false) {
        this.form = form;
        this.initData = elementInitData;
        this.key = elementInitData.key;
        
        if(!supressElement) {
            this.domElement = apogeeapp.ui.createElement("div",{"className":"apogee_configurablePanelLine"});
        }
    }
    
    /** This method returns the key for this ConfigurableElement within this panel. */
    getKey() {
        return this.key;
    }

    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return undefined;
    }   

    /** This hides or shows the given element within the panel. */
    setVisible(isVisible) {
        if(this.element) {
            if(isVisible) {
                this.style.display = "";
            }
            else {
                this.style.display = "none";
            }
        }
    }

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(formInitData) {
    }

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    updateValue(value) {
    }

    /** This method returns the DOM element for this configurable element. */
    getElement() {
        return this.domElement;
    }
    
    /** This method returns the DOM element for this configurable element. */
    getForm() {
        return this.form;
    }
    
    
    //===================================
    // Protected Methods
    //==================================
    
    /** This sets the DOM element. it should be called from the constructor of the extending object. 
     * @protected */
    setElement(element) {
        this.element = element;
    }
}





