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
        let labelElement = this.getLabelElement(elementInitData);
        if(labelElement) {
            containerElement.appendChild(labelElement);
        }
        
        //slider
        this.sliderElement = uiutil.createElement("input",{"type":"range"});
        containerElement.appendChild(this.sliderElement); 

        this.setFocusElement(this.sliderElement);

        this.changeListener = () => {
            this.inputDone();
            this.valueChanged();
        }

        this.sliderElement.addEventListener("change",this.changeListener);

        if(elementInitData.min !== undefined) {
            this.sliderElement.min = elementInitData.min;
        }
        if(elementInitData.max !== undefined) {
            this.sliderElement.max = elementInitData.max;
        }
        if(elementInitData.step !== undefined) {
            this.sliderElement.step = elementInitData.step;
        }

        //hint
        let hintElement = this.getHintElement(elementInitData);
        if(hintElement) {
            containerElement.appendChild(hintElement);
        }

        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        let stringValue = this.sliderElement.value;
        return parseFloat(stringValue);
    }  
    
    //===================================
    // protectd Methods
    //==================================

    /** This method updates the list of checked entries. */
    setValueImpl(value) {
        this.sliderElement.value = value;
    }

    destroy() {
        super.destroy();
        
        this.sliderElement.removeEventListener("change",this.changeListener);
        this.changeListener = null;
        this.sliderElement = null;
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.sliderElement.disabled = isDisabled;
    }
}

SliderElement.TYPE_NAME = "slider";

