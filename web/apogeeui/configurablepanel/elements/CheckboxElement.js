import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class CheckboxElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        let labelElement = this.getLabelElement(elementInitData);
        if(labelElement) {
            containerElement.appendChild(labelElement);
        }
        
        //checkbox field
        this.checkbox = uiutil.createElement("input",{"type":"checkbox"}); 

        this.setFocusElement(this.checkbox);
        
        //add dom listeners for events
        this.changeListener = () => {
            this.inputDone();
            this.valueChanged();
        }
        this.checkbox.addEventListener("change",this.changeListener);

        //add the tooltip
        if(elementInitData.tooltip) {
            let tooltipWrapper = document.createElement("div");
            tooltipWrapper.className = "apogee_tooltip_element";
            let tooltip = document.createElement("div");
            tooltip.className = "apogee_tooltip_text";
            tooltip.innerHTML = elementInitData.tooltip;
            tooltipWrapper.appendChild(this.checkbox);
            tooltipWrapper.appendChild(tooltip);
            containerElement.appendChild(tooltipWrapper);
        }
        else {
            containerElement.appendChild(this.checkbox);
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
        return this.checkbox.checked;
    } 

    destroy() {
        super.destroy();

        this.checkbox.removeEventListener("change",this.changeListener);
        this.changeListener = null;

        this.checkbox = null;
    }

    //===================================
    // protected Methods
    //==================================

    /** This method updates the UI value for a given element. */
    setValueImpl(value) {
        this.checkbox.checked = (value === true);
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.checkbox.disabled = isDisabled;
    }
}

CheckboxElement.TYPE_NAME = "checkbox";

