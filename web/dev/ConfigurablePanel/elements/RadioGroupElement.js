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
            
            this.labelSpacer = document.createElement("br");
            containerElement.appendChild(this.labelSpacer);
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
            if(elementInitData.value == value) radio.checked = true;
            this.buttonList.push(radio);
            containerElement.appendChild(radio);
            containerElement.appendChild(document.createTextNode(label));
            containerElement.appendChild(document.createElement("br"));
            
            if(elementInitData.disabled) radio.disabled = true;
        };
        elementInitData.entries.forEach(addButton);   
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

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action
    }

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    updateValue(value) {
        this.inputElement.value = value;
    }
}

apogeeapp.ui.RadioGroupElement.TYPE_NAME = "radioButtonGroup";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.RadioGroupElement.TYPE_NAME,apogeeapp.ui.RadioGroupElement);