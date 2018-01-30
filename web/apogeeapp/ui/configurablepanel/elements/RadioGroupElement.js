/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.RadioGroupElement = class extends apogeeapp.ui.ConfigurableElement {
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
            var radio = apogeeapp.ui.createElement("input");
            radio.type = "radio";
            radio.name = groupName;
            
            var label;
            var value;
            if(apogee.util.getObjectType(buttonInfo) == "Array") {
                label = buttonInfo[0]
                value = buttonInfo[1];     
            }
            else {
                label = buttonInfo;
                value = buttonInfo; 
            }
            radio.value = value;
            this.buttonList.push(radio);
            containerElement.appendChild(radio);
            containerElement.appendChild(document.createTextNode(label));
            if(!elementInitData.horizontal) containerElement.appendChild(document.createElement("br"));
        };
        elementInitData.entries.forEach(addButton);
        
        this._postInstantiateInit(elementInitData);
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
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getForm(),this.getValue());
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

apogeeapp.ui.RadioGroupElement.TYPE_NAME = "radioButtonGroup";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.RadioGroupElement);