import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class CheckboxGroupElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);

        //this element returns a list of selections
        this.setIsMultiselect(true)
        
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
        
        //check boxes
        this.checkboxList = [];
        this.valueMap = {};
        let focusElementSet = false;
        var addCheckbox = (checkboxInfo,index) => {
            var buttonContainer = uiutil.createElement("div");
            buttonContainer.style.display = elementInitData.horizontal ? "inline-block" : "block";
            containerElement.appendChild(buttonContainer);

            var checkbox = uiutil.createElement("input");
            checkbox.type = "checkbox";

            if(!focusElementSet) {
                this.setFocusElement(checkbox);
                focusElementSet = true;
            }

            var label;
            var value;
            if(Array.isArray(checkboxInfo)) {
                label = checkboxInfo[0]
                value = checkboxInfo[1];     
            }
            else {
                label = checkboxInfo;
                value = checkboxInfo; 
            }

            //checkbox only holds string values. We will store the user set value externally
            let standinValue = String(index);
            this.valueMap[standinValue] = value;
            checkbox.value = standinValue;

            this.checkboxList.push(checkbox);
            buttonContainer.appendChild(checkbox);
            buttonContainer.appendChild(document.createTextNode(label));

            if(elementInitData.horizontal) buttonContainer.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0"));
            
            if(elementInitData.disabled) checkbox.disabled = true;

            //add the dom listener
            checkbox.addEventListener("change",() => {
                this.inputDone();
                this.valueChanged();
            });
        };
        elementInitData.entries.forEach(addCheckbox);  
        
        //add dom listeners
        this.checkboxList.forEach(checkbox => checkbox.addEventListener("change",() => {
            this.inputDone();
            this.valueChanged();
        }));
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        //return the check value mapped back to the proper (potentially non-string) value for the checkbox
        return this.checkboxList.filter(checkbox => checkbox.checked).map(checkbox => this.valueMap[checkbox.value]); 
    }   

    //==================================
    // protected methods
    //==================================

    /** This method updates the UI value for a given element. */
    setValueImpl(valueList) {
        this.checkboxList.forEach(checkbox => {
            let standinValue = checkbox.value;
            let properValue = this.valueMap[standinValue];
            checkbox.checked = (valueList.indexOf(properValue) >= 0);
        });
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.checkboxList.forEach(checkbox => checkbox.disabled = isDisabled);
    }
}

CheckboxGroupElement.TYPE_NAME = "checkboxGroup";


