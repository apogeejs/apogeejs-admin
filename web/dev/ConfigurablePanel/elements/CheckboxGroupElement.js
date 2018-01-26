/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.CheckboxGroupElement = class extends apogeeapp.ui.ConfigurableElement {
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
        
        //check boxes
        this.checkboxList = [];
        var onChange;
        if(elementInitData.onChange) {
            var onChange = () => {
                elementInitData.onChange(this.getForm(),this.getValue());
            }
        }
        else {
            onChange = null;
        }
        
        var addCheckbox = checkboxInfo => {
            var checkbox = apogeeapp.ui.createElement("input");
            checkbox.type = "checkbox";
            
            var label;
            var value;
            if(apogee.util.getObjectType(checkboxInfo) == "Array") {
                label = checkboxInfo[0]
                value = checkboxInfo[1];     
            }
            else {
                label = checkboxInfo;
                value = checkboxInfo; 
            }
            checkbox.value = value;
            if(elementInitData.value) {
                if(elementInitData.value.indexOf(value) >= 0) checkbox.checked = true;
            }
            if(onChange) {
                checkbox.onchange = onChange;
            }
            this.checkboxList.push(checkbox);
            containerElement.appendChild(checkbox);
            containerElement.appendChild(document.createTextNode(label));
            containerElement.appendChild(document.createElement("br"));
            
            if(elementInitData.disabled) checkbox.disabled = true;
        };
        elementInitData.entries.forEach(addCheckbox);       
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.checkboxList.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
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

apogeeapp.ui.CheckboxGroupElement.TYPE_NAME = "checkboxGroup";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.CheckboxGroupElement.TYPE_NAME,apogeeapp.ui.CheckboxGroupElement);