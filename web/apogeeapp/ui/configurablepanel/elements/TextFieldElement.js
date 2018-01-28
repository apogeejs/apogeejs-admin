/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.TextFieldElement = class extends apogeeapp.ui.ConfigurableElement {
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
        this.inputElement = apogeeapp.ui.createElement("input",{"type":"text"});
        if(elementInitData.value) {
            this.inputElement.value = elementInitData.value;
        }
        if(elementInitData.disabled) {
            this.inputElement.disabled = true;
        }
        containerElement.appendChild(this.inputElement);   
        
        //events
        if(elementInitData.onChange) {
            this.addOnChange(elementInitData.onChange);
        }
        if(elementInitData.onCharacter) {
            this.addOnCharacter(elementInitData.onCharacter);
        }
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.inputElement.value.trim();
    }   

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action
    }

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    updateValue(value) {
        this.inputElement.value = value;
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        this.inputElement.onchange = () => {
            onChange(this.getForm(),this.getValue());
        }
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnCharacter(onCharacter) {
        this.inputElement.oninput = () => {
            onCharacter(this.getForm(),this.getValue());
        }
    }
}

apogeeapp.ui.TextFieldElement.TYPE_NAME = "textField";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.TextFieldElement.TYPE_NAME,apogeeapp.ui.TextFieldElement);