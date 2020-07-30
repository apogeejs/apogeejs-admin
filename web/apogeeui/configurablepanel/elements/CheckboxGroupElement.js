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
        var addCheckbox = (checkboxInfo,index) => {
            var buttonContainer = uiutil.createElement("div");
            buttonContainer.style.display = elementInitData.horizontal ? "inline-block" : "block";
            containerElement.appendChild(buttonContainer);

            var checkbox = uiutil.createElement("input");
            checkbox.type = "checkbox";
            
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
        };
        elementInitData.entries.forEach(addCheckbox);   
        
        this._postInstantiateInit(elementInitData);
        
        //add suport for selection children
        this.setChildState = ConfigurableElement.setChildStateArrayValue;
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        //return the check value mapped back to the proper (potentially non-string) value for the checkbox
        return this.checkboxList.filter(checkbox => checkbox.checked).map(checkbox => this.valueMap[checkbox.value]); 
    }   

    /** This method updates the list of checked entries. */
    setValue(valueList) {
        this.checkboxList.forEach(checkbox => {
            let standinValue = checkbox.value;
            let properValue = this.valueMap[standinValue];
            checkbox.checked = (valueList.indexOf(properValue) >= 0);
        });
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.checkboxList.forEach(checkbox => checkbox.addEventListener("change",onChangeImpl));
    }

    //==================================
    // protected methods
    //==================================
    /** This method returns the onValueChange handler. It overrides the default 
     * implementation to make the dependent element visible if the parent element, this checkbox group
     * CONTAINS the given value, rather than is equal to the given value. */
    getDependentSelectHandler(dependentElement,value,keepActiveOnHide) {
        return parentValue => {
            let state;
            if(parentValue == value) {
                state = ConfigurablePanelConstants.STATE_NORMAL;
            }
            else {
                state = (keepActiveOnHide ? ConfigurablePanelConstants.STATE_HIDDEN : ConfigurablePanelConstants.STATE_INACTIVE);
            }

            if(dependentElement.getState() != state) {
                dependentElement.setState(state);
            }
        }
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.checkboxList.forEach(checkbox => checkbox.disabled = isDisabled);
    }
}

CheckboxGroupElement.TYPE_NAME = "checkboxGroup";


