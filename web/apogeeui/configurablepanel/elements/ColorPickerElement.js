import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class ColorPickerElement extends ConfigurableElement {
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
        
        //slider
        this.colorPickerElement = uiutil.createElement("input",{"type":"color"});
        containerElement.appendChild(this.colorPickerElement); 

        this.colorPickerElement.addEventListener("change",() => {
            this.inputDone();
            this.valueChanged();
        });

        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.colorPickerElement.value;
    }  
    
    //===================================
    // protectd Methods
    //==================================

    /** This method updates the list of checked entries. */
    setValueImpl(value) {
        this.colorPickerElement.value = value;
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.colorPickerElement.disabled = isDisabled;
    }
}

ColorPickerElement.TYPE_NAME = "colorPicker";

