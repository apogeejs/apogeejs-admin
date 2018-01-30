/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.TextareaElement = class extends apogeeapp.ui.ConfigurableElement {
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
        this.inputElement = apogeeapp.ui.createElement("textarea");
        if(elementInitData.rows) {
            this.inputElement.rows = elementInitData.rows;
        }
        if(elementInitData.cols) {
            this.inputElement.cols = elementInitData.cols;
        }
        containerElement.appendChild(this.inputElement); 
        
        //non standard events
        if(elementInitData.onChangeCompleted) {
            this.addOnChangeCompleted(elementInitData.onChangeCompleted);
        }
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.inputElement.value.trim();
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.inputElement.value = value;
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getForm(),this.getValue());
        }
        this.inputElement.addEventListener("input",onChangeImpl);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChangeCompleted(onChangeCompleted) {
        var onChangeCompletedImpl = () => {
            onChangeCompleted(this.getForm(),this.getValue());
        }
        this.inputElement.addEventListener("change",onChangeCompletedImpl);
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.inputElement.disabled = isDisabled;
    }
}

apogeeapp.ui.TextareaElement.TYPE_NAME = "textarea";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.TextareaElement.TYPE_NAME,apogeeapp.ui.TextareaElement);