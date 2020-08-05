import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class DropdownElement extends ConfigurableElement {
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
        
        this.valueMap = {};
        this.select = uiutil.createElement("select");
        var addEntry = (entryInfo,index) => {
            var label;
            var value;
            if(Array.isArray(entryInfo)) {
                label = entryInfo[0]
                value = entryInfo[1];
            }
            else {
                label = entryInfo;
                value = entryInfo;   
            }

            let standinValue = String(index);
            this.valueMap[standinValue] = value

            var entry = document.createElement("option");
            entry.text = label;
            entry.value = standinValue;
            this.select.appendChild(entry);
        }
        if(elementInitData.entries) {
            elementInitData.entries.forEach(addEntry);
        }
        containerElement.appendChild(this.select); 

        //add dom listeners
        this.select.addEventListener("change",() => {
            this.inputDone();
            this.valueChanged();
        });
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.valueMap[this.select.value];
    }  
    
    //===================================
    // protected Methods
    //==================================

    /** This method updates the UI value for a given element. */
    setValueImpl(value) {
        let standinValue;
        for(let key in this.valueMap) {
            if(this.valueMap[key] === value) standinValue = key;
        }
        if(standinValue !== undefined) {
            this.select.value = standinValue;
        }
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.select.disabled = isDisabled;
    }
}

DropdownElement.TYPE_NAME = "dropdown";


