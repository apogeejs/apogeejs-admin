import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import apogeeui from "/apogeeui/apogeeui.js";

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
        var addCheckbox = checkboxInfo => {
            var buttonContainer = apogeeui.createElement("div");
            buttonContainer.style.display = elementInitData.horizontal ? "inline-block" : "block";
            containerElement.appendChild(buttonContainer);

            var checkbox = apogeeui.createElement("input");
            checkbox.type = "checkbox";
            
            var label;
            var value;
            if(apogeeutil.getObjectType(checkboxInfo) == "Array") {
                label = checkboxInfo[0]
                value = checkboxInfo[1];     
            }
            else {
                label = checkboxInfo;
                value = checkboxInfo; 
            }
            checkbox.value = value;
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
        return this.checkboxList.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    }   

    /** This method updates the list of checked entries. */
    setValue(valueList) {
        this.checkboxList.forEach(checkbox => checkbox.checked = (valueList.indexOf(checkbox.value) >= 0));
        
        //needed for selection children
        this.checkChildSelection(valueList);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.checkboxList.forEach(checkbox => checkbox.addEventListener("change",onChangeImpl));
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.checkboxList.forEach(checkbox => checkbox.disabled = isDisabled);
    }
}

CheckboxGroupElement.TYPE_NAME = "checkboxGroup";


