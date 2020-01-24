import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class CheckboxElement extends ConfigurableElement {
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
        
        //checkbox field
        this.checkbox = apogeeui.createElement("input",{"type":"checkbox"});
        containerElement.appendChild(this.checkbox);  
        
        this._postInstantiateInit(elementInitData);
        
        //add suport for selection children
        this.setChildState = ConfigurableElement.setChildStateSingleValue;
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.checkbox.checked;
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.checkbox.checked = (value === true);
        
        //needed for selection children
        this.checkChildSelection(value);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.checkbox.addEventListener("change",onChangeImpl);
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.checkbox.disabled = isDisabled;
    }
}

CheckboxElement.TYPE_NAME = "checkbox";

