import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class RadioGroupElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
            
            if(!elementInitData.horizontal) containerElement.appendChild(document.createElement("br"));
        }
        else {
            this.labelElement = null;
        }
        
        //radio buttons
        this.buttonList = [];
        var groupName = elementInitData.groupName;
        var addButton = buttonInfo => {
            var buttonContainer = apogeeui.createElement("div");
            buttonContainer.style.display = elementInitData.horizontal ? "inline-block" : "block";
            containerElement.appendChild(buttonContainer);

            var radio = apogeeui.createElement("input");
            radio.type = "radio";
            radio.name = groupName;
            
            var label;
            var value;
            if(apogeeutil.getObjectType(buttonInfo) == "Array") {
                label = buttonInfo[0]
                value = buttonInfo[1];     
            }
            else {
                label = buttonInfo;
                value = buttonInfo; 
            }
            radio.value = value;
            this.buttonList.push(radio);
            buttonContainer.appendChild(radio);
            buttonContainer.appendChild(document.createTextNode(label));
            
            if(elementInitData.horizontal) buttonContainer.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0"));
        };
        elementInitData.entries.forEach(addButton);
        
        this._postInstantiateInit(elementInitData);
        
        //add suport for selection children
        this.setChildState = ConfigurableElement.setChildStateSingleValue;
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        var checkedRadio = this.buttonList.find(radio => radio.checked);
        if(checkedRadio) {
            return checkedRadio.value;
        }
        else {
            return undefined;
        }
    }   

    /** This method updates the list of checked entries. */
    setValue(value) {
        var checkedButton = this.buttonList.find(radioButton => (radioButton.value == value));
        if(checkedButton) {
            checkedButton.checked = true;
        }
        
        //needed for selection children
        this.checkChildSelection(value);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.buttonList.forEach(radioButton => radioButton.addEventListener("change",onChangeImpl));
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.buttonList.forEach(radioButton => radioButton.disabled = isDisabled);
    }
}

RadioGroupElement.TYPE_NAME = "radioButtonGroup";

