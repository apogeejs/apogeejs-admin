/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.DropdownElement = class extends apogeeapp.ui.ConfigurableElement {
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
        
        this.select = apogeeapp.ui.createElement("select");
        var addEntry = entryInfo => {
            var label;
            var value;
            if(apogee.util.getObjectType(entryInfo) == "Array") {
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
        elementInitData.entries.forEach(addEntry);
        if(elementInitData.value) {
            this.select.value = elementInitData.value;
        }
        if(elementInitData.disabled) {
            this.select.disabled = true;
        }
        containerElement.appendChild(this.select);        
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.select.value;
    }   

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action
    }

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    updateValue(value) {
        this.select.value = value;
    }
}

apogeeapp.ui.DropdownElement.TYPE_NAME = "dropdown";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.DropdownElement.TYPE_NAME,apogeeapp.ui.DropdownElement);