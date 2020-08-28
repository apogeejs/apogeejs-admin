import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class TextFieldElement extends ConfigurableElement {
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
        
        //text field (maight had password flag)
        var type = (elementInitData.password === true) ? "password" : "text";
        this.inputElement = uiutil.createElement("input",{"type":type});
        containerElement.appendChild(this.inputElement); 
        this.setFocusElement(this.inputElement);
        
        if(elementInitData.size !== undefined) {
            this.inputElement.size = elementInitData.size;
        }

        //add dom listeners for events
        this.inputElement.addEventListener("input",() => this.inputDone());
        this.inputElement.addEventListener("change",() => this.valueChanged());
        
        this._postInstantiateInit(elementInitData);
    }

    getValue() {
        return this.inputElement.value.trim();
    }  
    
    //===================================
    // protected Methods
    //==================================

    /** This method updates the UI value for a given element. */
    setValueImpl(value) {
        this.inputElement.value = value;
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.inputElement.disabled = isDisabled;
    }
}

TextFieldElement.TYPE_NAME = "textField";
