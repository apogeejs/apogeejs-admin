import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class RadioGroupElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        let labelElement = this.getLabelElement(elementInitData);
        if(labelElement) {
            containerElement.appendChild(labelElement);
        }

        //hint
        //if not horizontal, put the hint after the label
        if(!elementInitData.horizontal) {
            let hintElement = this.getHintElement(elementInitData);
            if(hintElement) {
                containerElement.appendChild(hintElement);
            }
        }

        //add dom listeners for events
        this.changeListener = () => {
            this.inputDone();
            this.valueChanged();
        }
        
        //radio buttons
        this.buttonList = [];
        this.valueMap = {};
        let focusElementSet = false;
        var groupName = elementInitData.groupName;
        if(!groupName) groupName = getRandomString();
        var addButton = (buttonInfo,index) => {
            var buttonContainer = uiutil.createElement("div");
            buttonContainer.style.display = elementInitData.horizontal ? "inline-block" : "block";
            containerElement.appendChild(buttonContainer);

            var radio = uiutil.createElement("input");
            radio.type = "radio";
            radio.name = groupName;

            if(!focusElementSet) {
                this.setFocusElement(radio);
                focusElementSet = true;
            }
            
            var label;
            var value;
            if(Array.isArray(buttonInfo)) {
                label = buttonInfo[0]
                value = buttonInfo[1];     
            }
            else {
                label = buttonInfo;
                value = buttonInfo; 
            }

            //radiobutton only holds string values. We will store the user set value externally
            let standinValue = String(index);
            this.valueMap[standinValue] = value;
            radio.value = standinValue;

            this.buttonList.push(radio);
            buttonContainer.appendChild(radio);
            buttonContainer.appendChild(document.createTextNode(label));
            
            if(elementInitData.horizontal) buttonContainer.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0"));

            //add dom listeners
            radio.addEventListener("change",this.changeListener);
        };
        elementInitData.entries.forEach(addButton);

        //hint
        //if  horizontal, put the hint at the end
        if(elementInitData.horizontal) {
            let hintElement = this.getHintElement(elementInitData);
            if(hintElement) {
                containerElement.appendChild(hintElement);
            }

        }
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        var checkedRadio = this.buttonList.find(radio => radio.checked);
        if(checkedRadio) {
            return this.valueMap[checkedRadio.value];
        }
        else {
            return undefined;
        }
    }  
    
    //===================================
    // protectd Methods
    //==================================

    /** This method updates the list of checked entries. */
    setValueImpl(value) {
        var checkedButton = this.buttonList.find(radioButton => {
            let standinValue = radioButton.value;
            let properButtonValue = this.valueMap[standinValue];
            return (properButtonValue === value);
        });

        if(checkedButton) {
            checkedButton.checked = true;
        }
    }

    destroy() {
        super.destroy();
        
        this.buttonList.forEach(radioButton => {
            radioButton.removeEventListener("change",this.changeListener);
        })
        this.buttonList = [];
        this.changeListener = null;
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.buttonList.forEach(radioButton => radioButton.disabled = isDisabled);
    }
}

RadioGroupElement.TYPE_NAME = "radioButtonGroup";

function getRandomString() {
    return Math.random().toString(36).substring(2, 15);
}

