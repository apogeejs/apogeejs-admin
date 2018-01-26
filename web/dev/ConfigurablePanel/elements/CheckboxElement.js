/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.CheckboxElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
        }
        else {
            this.labelElement = null;
        }
        
        //text field
        this.checkbox = apogeeapp.ui.createElement("input",{"type":"checkbox"});
        if(elementInitData.value === true) {
            this.checkbox.checked = true;
        }
        if(elementInitData.disabled) {
            this.checkbox.disabled = true;
        }
        containerElement.appendChild(this.checkbox);  
        
        //events
        if(elementInitData.onChange) {
            this.addOnChange(elementInitData.onChange);
        }
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.checkbox.checked;
    }   

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action
    }

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    updateValue(value) {
        if(value === true) {
            this.checkbox.checked = true;
        }
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        this.checkbox.onchange = () => {
            onChange(this.getForm(),this.getValue());
        }
    }
}

apogeeapp.ui.CheckboxElement.TYPE_NAME = "checkbox";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.CheckboxElement.TYPE_NAME,apogeeapp.ui.CheckboxElement);