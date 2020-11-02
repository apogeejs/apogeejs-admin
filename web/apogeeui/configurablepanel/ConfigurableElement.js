import ConfigurablePanelConstants from "/apogeeui/configurablepanel/ConfigurablePanelConstants.js";
import uiutil from "/apogeeui/uiutil.js";
import {getHelpElement} from "/apogeeui/tooltip/tooltip.js";

/** This is an element that composes the content of a configurable panel.
 * 
 * @class 
 */
export default class ConfigurableElement {
    constructor(form,elementInitData) {
        this.form = form;
        this.state = ConfigurablePanelConstants.STATE_NORMAL;
        this.key = elementInitData.key;
        this.meta = elementInitData.meta;
        this.selectorConfig = elementInitData.selector;
        this.isMultiselect = false;
        this.focusElement = null;

        this.onChangeListeners = [];
        this.onInputListeners = [];

        this.domElement = uiutil.createElement("div",{"className":ConfigurableElement.CONTAINER_CLASS});
        //explicitly set the margin and padding
        this.domElement.style.margin = ConfigurableElement.ELEMENT_MARGIN_STANDARD;
        this.domElement.style.padding = ConfigurableElement.ELEMENT_PADDING_STANDARD;
        this.domElement.style.display = ConfigurableElement.ELEMENT_DISPLAY_FULL_LINE;

        this.errorDiv;

        this.visibleDisplayStyle = ConfigurableElement.ELEMENT_DISPLAY_FULL_LINE;
    }
    
    /** This method returns the key for this ConfigurableElement within this panel. */
    getKey() {
        return this.key;
    }

    /** This method returns the configured meta value for this element. */
    getMeta() {
        return this.meta;
    }

    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return undefined;
    }  

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.setValueImpl(value);
        this.valueChanged(true);
    }
    
    getState() {
        return this.state;
    }

    /** This hides or shows the given element within the panel. */
    setState(state) {
        this.state = state;
        switch(state) {
            case ConfigurablePanelConstants.STATE_NORMAL:
                this._setVisible(true);
                this._setDisabled(false);
                break;
                
            case ConfigurablePanelConstants.STATE_DISABLED:
                this._setVisible(true);
                this._setDisabled(true);
                break;
                
            case ConfigurablePanelConstants.STATE_HIDDEN:
                this._setVisible(false);
                break;
                
            case ConfigurablePanelConstants.STATE_INACTIVE:
                this._setVisible(false);
                break;
        }
        
    }

    /** This function attempts to give focus to the element. It will return true if element successfullly got focus. */
    giveFocus() {
        if((this.state == ConfigurablePanelConstants.STATE_NORMAL)&&(this.focusElement)) {
            this.focusElement.focus();
            return (document.activeElement == this.focusElement);
        }
        else {
            return false;
        }
    }

    /** This method returns the DOM element for this configurable element. */
    getElement() {
        return this.domElement;
    }
    
    /** This method returns the parent form for this configurable element. */
    getForm() {
        return this.form;
    }

    getBaseForm() {
        return this.form.getBaseForm();
    }

    addOnChange(onChange) {
        this.onChangeListeners.push(onChange);
    }

    addOnInput(onInput) {
        this.onInputListeners.push(onInput);
    }

    /** This is used to determine what type of child element this is for a panel. */
    get elementType() {
        return "ConfigurableElement";
    }

    /** This method is called during configuration to populate the selectors of the element. */
    populateSelectors() {
        if(this.selectorConfig) {
            try {
                this._addSelector(this.selectorConfig);
            }
            catch(error) {
                let errorMsg = "Error calling selector: " + error.toString();
                console.error(errorMsg);
                if(error.stack) console.error(error.stack);
                this.setElementErrorMsg(errorMsg)
            }
        }
    }

    //==================================
    //protected methods
    //==================================

    /** If the element returns multiple selected values, such as a checkbox group, then isMultiselect
     * should be set to true. The default is false. */
    setIsMultiselect(isMultiselect) {
        this.isMultiselect = isMultiselect;
    }

    /** This method should be implemented by extending to set the value for the element. The method 
     * "valueChanged" does not need to be called. It is called automatically. */
    setValueImpl(value) {}

    /** This method should be called when the value changes. Here value changed refers to a completed
     * input. For example typing a character a text field should not trigger this event, only the update 
     * of the value of a given field. */
    valueChanged() {
        if(this.onChangeListeners.length > 0) {
            let value =this.getValue();
            this.onChangeListeners.forEach( listener => listener(value,this.form));
        }
    }

    /** This method should be called input is done at the user interface. Thiw is should be called when typing
     * characters in a text field or when changing an element such as a checkbox. */
    inputDone() {
        if(this.onInputListeners.length > 0) {
            let value =this.getValue();
            this.onInputListeners.forEach( listener => listener(value,this.form));
        }
    }

    /** This function should be used to set the display state for the element, since that variable
     * is also used to control visibility. */
    setVisibleDisplayStyle(visibleDisplayStyle) {
        this.visibleDisplayStyle = visibleDisplayStyle;
        if((this.domElement)&&(this.domElement.style.display != "none")) {
            this.domElement.style.display = this.visibleDisplayStyle;
        }
    }

    /** This method should be called by extending methods to set the focus element, if there is one. */
    setFocusElement(focusElement) {
        this.focusElement = focusElement;
    }

    /** This cleans up the element. It should be extended to do any additional cleanup in an extending class. */
    destroy() {
        this.form = null;
        this.onChangeListeners = [];
        this.onInputListeners = [];
        this.domElement = null;
        this.focusElement  = null;
    }

    /** This function creates a label element and returns it if the element init data defines a label.
     * Otherwise it returns null. */
    getLabelElement(elementInitData) {
        if(elementInitData.label) {
            let labelElement = document.createElement("span");
            labelElement.className = "apogee_configurablePanelLabel apogee_configurableElement_hideSelection";
            labelElement.innerHTML = elementInitData.label;
            return labelElement;
        }
        else {
            return null;
        }
    }

    getHelpElement(elementInitData) {
        if(elementInitData.help) {
            //note - the funciton below is the imported one, not the class member function
            let options = {
                wrapperAddonClass: "apogee_configurableElementHelpWrapperAddon",
                textAddonClass: "apogee_configurableElementHelpTextAddon"
            };
            if(elementInitData.help.length > 24) {
                options.textWidth = "300px";
            }
            let helpElements = getHelpElement(elementInitData.help,options);
            helpElements.wrapperElement.classList.add("apogee_configurableElementHelpAddon");
            return helpElements.wrapperElement;
        }
        else {
            return null;
        }
    }

    /** This function creates a label element and returns it if the element init data defines a label.
     * Otherwise it returns null. */
    getHintElement(elementInitData) {
        if(elementInitData.hint) {
            let hintElement = document.createElement("span");
            hintElement.className = "apogee_configurablePanelHint";
            hintElement.innerHTML = elementInitData.hint;
            return hintElement;
        }
        else {
            return null;
        }
    }

    /** This sets the content of a div that displays an error mesage */
    setElementErrorMsg(errorMsg) {
        if(!this.errorDiv) {
            //add an error display
            this.errorDiv = document.createElement("div");
            this.errorDiv.className = "apogee_configubleElementErrorDiv";
            this.domElement.append(this.errorDiv);
        }
        this.errorDiv.innerHTML = errorMsg;
    }
    
    //===================================
    // internal Methods
    //==================================
    
    /** This method does standard initialization which requires the element be created. 
     * Any extending method should call this at the end of the constructor. */
    _postInstantiateInit(elementInitData) {
        
        //standard fields
        if(elementInitData.value !== undefined) {
            this.setValue(elementInitData.value);
        }
        
        var state = (elementInitData.state != undefined) ? elementInitData.state : ConfigurablePanelConstants.STATE_NORMAL;
        this.setState(state);
        
        //standard events
        if(elementInitData.onChange) {
            this.addOnChange(elementInitData.onChange);
        }
        if(elementInitData.onInput) {
            this.addOnInput(elementInitData.onInput);
        }
    }
    
    _setDisabled(isDisabled) {};
    
    _setVisible(isVisible) {
        if(!this.domElement) return;

        if(isVisible) {
            this.domElement.style.display = this.visibleDisplayStyle;
        }
        else {
            this.domElement.style.display = "none";
        }
    }

    /** This processes a selector entry from the init data */
    _addSelector(selectorConfig) {

        //get parent element list
        let parentKeys = selectorConfig.parentKey ? [selectorConfig.parentKey] : selectorConfig.parentKeys;
        if(!parentKeys) throw new Error("Parent key(s) not found for selectable child element " + selectorConfig.key);
        let parentElements = parentKeys.map( parentKey => {
            if(Array.isArray(parentKey)) {
                //absolute path
                let baseForm = this.getBaseForm();
                return baseForm.getEntryFromPath(parentKey);
            }
            else {
                //local key in form
                return this.form.getEntry(parentKey);

            }
        })
        if(parentElements.indexOf(undefined) >= 0) throw new Error("Parent element not found for selectable child element " + selectorConfig.key);

        
        //get the internal function
        let actionFunction;
        if(selectorConfig.actionFunction) {
            actionFunction = selectorConfig.actionFunction;
        }
        else {
            actionFunction = this._getPredefinedActionFunction(selectorConfig,parentElements);
        }
        if(!actionFunction) throw new Error("Action function not found for selectable child element " + selectorConfig.key);

        //handler
        let functionArgs = [this].concat(parentElements);
        let onValueChange = () => actionFunction.apply(null,functionArgs);
        
        if(onValueChange) {
            parentElements.forEach(parentElement =>parentElement._addDependentCallback(onValueChange));
        }
    }

    /** This method gets an instance of a predefined action function for the given selector config. */
    _getPredefinedActionFunction(selectorConfig,parentElements) {

        //these only apply to single parent objects, not multiple parents
        let inputParentElement = parentElements[0];

        //get the action
        let action = selectorConfig.action;
        if(!action) action = ConfigurablePanelConstants.DEFAULT_SELECTOR_ACTION;

        //get the target values. This can be a single value of a list of values
        let target, targetIsMultichoice;
        if(selectorConfig.parentValue !== undefined) {
            target = selectorConfig.parentValue;
            targetIsMultichoice = false;
        }
        else if(selectorConfig.parentValues !== undefined) {
            target = selectorConfig.parentValues;
            targetIsMultichoice = true;
        }
        else {
            throw new Error("A child selectable element must contain a value or list of values: " + selectorConfig.key)
        }

        //get the match check function
        //handle cases of potential multiple target values and multiple select parents
        let valueMatch;
        if(inputParentElement.isMultiselect) {
            if(targetIsMultichoice) {
                valueMatch = parentValue => containsCommonValue(target,parentValue);
            }
            else {
                valueMatch = parentValue => (parentValue.indexOf(target) >= 0);
            }
        }
        else {
            if(targetIsMultichoice) {
                valueMatch = parentValue => (target.indexOf(parentValue) >= 0);
            }
            else {
                valueMatch = parentValue => (parentValue == target);
            }
        }
        
        //this is the function that will do the test at compare time
        return (childElement,parentElement) => {
            let match = valueMatch(parentElement.getValue());
            if(action == ConfigurablePanelConstants.SELECTOR_ACTION_VALUE) {
                if(childElement.getValue() !== match) {
                    childElement.setValue(match);
                }
            }
            else {
                let state; 
                if(match) {
                    state = ConfigurablePanelConstants.STATE_NORMAL;
                }
                else {
                    state = ConfigurablePanelConstants.SELECTOR_FALSE_STATE[action];
                }
                if(childElement.getState() != state) {
                    childElement.setState(state);
                }
            }
        }
    }

    /** This function adds a callback that came from config element initialization */
    _addDependentCallback(onValueChange) {
        if(!this.dependentCallbacks) {
            this._initForDependents();
        }
        this.dependentCallbacks.push(onValueChange);

        //call now to initialize state
        try {
            onValueChange();
        }
        catch(error) {
            let errorMsg = "Error calling selector: " + error.toString();
            console.error(errorMsg);
            if(error.stack) console.error(error.stack);
            this.setElementErrorMsg(errorMsg);
        }
    }

    /** This function calls all the onValueChange callbacks for dependent elements. */
    _callDependentCallbacks() {
        if(this.dependentCallbacks) {
            try {
                this.dependentCallbacks.forEach( onValueChange => onValueChange() );
            }
            catch(error) {
                let errorMsg = "Error calling selector: " + error.toString();
                console.error(errorMsg);
                if(error.stack) console.error(error.stack);
                this.setElementErrorMsg(errorMsg)
            }
        }
    }

    _initForDependents() {
        this.dependentCallbacks = [];
        this.addOnChange( (value,form) => this._callDependentCallbacks() );
    }
            
}

ConfigurableElement.CONTAINER_CLASS = "apogee_configurablePanelLine";

ConfigurableElement.ELEMENT_MARGIN_STANDARD = "0px";
ConfigurableElement.ELEMENT_MARGIN_NONE = "0px";
ConfigurableElement.ELEMENT_PADDING_STANDARD = "4px";
ConfigurableElement.ELEMENT_PADDING_NONE = "0px";
ConfigurableElement.ELEMENT_DISPLAY_FULL_LINE = "block";
ConfigurableElement.ELEMENT_DISPLAY_PARTIAL_LINE = "inline-block";
ConfigurableElement.ELEMENT_DISPLAY_INVISIBLE = "none";

//================
//Other functions
//================

/**This function checks if the two array share any common values. */
function containsCommonValue(array1,array2) {
    return array1.some( value => (array2.indexOf(value) >= 0) );
}


