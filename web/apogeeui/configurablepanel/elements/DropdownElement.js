import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class DropdownElement extends ConfigurableElement {
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
        
        this.select = uiutil.createElement("select");
        var addEntry = entryInfo => {
            var label;
            var value;
            if(apogeeutil.getObjectType(entryInfo) == "Array") {
                label = entryInfo[0]
                value = entryInfo[1];
            }
            else {
                label = entryInfo;
                value = entryInfo;   
            }
            var entry = document.createElement("option");
            entry.text = label;
            entry.value = value;
            this.select.appendChild(entry);
        }
        if(elementInitData.entries) {
            elementInitData.entries.forEach(addEntry);
        }
        containerElement.appendChild(this.select); 
        
        this._postInstantiateInit(elementInitData);
        
        //add suport for selection children
        this.setChildState = ConfigurableElement.setChildStateSingleValue;
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.select.value;
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.select.value = value;
        
        //needed for selection children
        //this.checkChildSelection(value);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.select.addEventListener("change",onChangeImpl);
    }
    
    
  
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.select.disabled = isDisabled;
    }
}

DropdownElement.TYPE_NAME = "dropdown";


