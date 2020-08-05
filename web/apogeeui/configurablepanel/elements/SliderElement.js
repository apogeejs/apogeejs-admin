import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class SliderElement extends ConfigurableElement {
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
        this.sliderElement = uiutil.createElement("input",{"type":"range"});
        containerElement.appendChild(this.sliderElement); 

        this.sliderElement.addEventListener("change",() => {
            this.inputDone();
            this.valueChanged();
        });

        if(elementInitData.min !== undefined) {
            this.sliderElement.min = elementInitData.min;
        }
        if(elementInitData.max !== undefined) {
            this.sliderElement.max = elementInitData.max;
        }
        if(elementInitData.step !== undefined) {
            this.sliderElement.step = elementInitData.step;
        }

        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.sliderElement.value;
    }  
    
    //===================================
    // protectd Methods
    //==================================

    /** This method updates the list of checked entries. */
    setValueImpl(value) {
        this.sliderElement.value = value;
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.sliderElement.disabled = isDisabled;
    }
}

SliderElement.TYPE_NAME = "slider";

