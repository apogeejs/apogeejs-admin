import ConfigurablePanelConstants from "/apogeeui/configurablepanel/ConfigurablePanelConstants.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an element that composes the content of a configurable panel.
 * 
 * @class 
 */
export default class ConfigurableElement {
    constructor(form,elementInitData,optionalContainerClassName = ConfigurableElement.CONTAINER_CLASS_STANDARD) {
        this.form = form;
        this.key = elementInitData.key;
        this.meta = elementInitData.meta;
        this.domElement = uiutil.createElement("div",{"className":optionalContainerClassName});
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

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
    }

    /** This method returns the DOM element for this configurable element. */
    getElement() {
        return this.domElement;
    }
    
    /** This method returns the parent form for this configurable element. */
    getForm() {
        return this.form;
    }

    //==================================
    //protecxted methods
    //==================================

    /** This method returns the onValueChange handler to make the dependent element
     * visible when the parent element (as the element depended on) has the given value. */
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
        
        //dependent element logic
        if(elementInitData.selector) {
            this._addSelector(elementInitData.selector);
        }
        if(elementInitData.inherit) {
            if(Array.isArray(elementInitData.inherit)) {
                elementInitData.inherit.forEach(inheritConfig => this._addInherit(inheritConfig));
            }
            else {
                throw new Error("Inherit config should be an array: " + elementInitData.key);
            }
        }
        if(elementInitData.react) {
            if(Array.isArray(elementInitData.react)) {
                elementInitData.react.forEach(reactConfig => this._addReact(reactConfig));
            }
            else {
                throw new Error("React config should be an array: " + elementInitData.key);
            }
        }
    }
    
    _setDisabled(isDisabled) {};
    
    _setVisible(isVisible) {
        if(isVisible) {
            this.domElement.style.display = "";
        }
        else {
            this.domElement.style.display = "none";
        }
    }

    /** This processes a selector entry from the init data */
    _addSelector(selectorConfig) {
        let parentKey = selectorConfig.parentKey;
        let parentValue = selectorConfig.parentValue;
        let keepActiveOnHide =  selectorConfig.keepActiveOnHide;

        if(!parentKey) throw new Error("Parent key is required for a selectable child element:" + elementInitData.key);
        if(parentValue === undefined) throw new Error("A child selectable element must contain a value: " + elementInitData.key)
        let parentElement = this.form.getEntry(parentKey);
        if(!parentElement) throw new Error("Parent element " + parentKey + " not found for selectable child element " + elementInitData.key);
        
        let onValueChange = parentElement.getDependentSelectHandler(this,parentValue,keepActiveOnHide);
        if(onValueChange) {
            parentElement._addDependentCallback(onValueChange);
        }
    }

    /** This processes a inherit entry from the init data */
    _addInherit(inheritConfig) {
        let parentKey = inheritConfig.parentKey;
        let childKey = inheritConfig.childKey;

        if(!parentKey) throw new Error("A parent key is required for a inherit child element:" + elementInitData.key);
        if(!childKey) throw new Error("A child key is required for an inherit child element: " + elementInitData.key)
        let parentElement = this.form.getEntry(parentKey);
        if(!parentElement) throw new Error("Parent element " + parentKey + " not found for inherit child element " + elementInitData.key);
        if(!this.inherit) throw new Error("The element " + elementInitData.key + " does not support inherit");
        
        let onValueChange = (parentValue) => {
            this.inherit(childKey,parentValue);
        }
        parentElement._addDependentCallback(onValueChange);
    }

    /** This processes a react entry from the init data */
    _addReact(reactConfig) {
        let parentKey = reactConfig.parentKey;
        let onValueChangeGenerator = reactConfig.generator;

        if(!parentKey) throw new Error("A parent key is required for a react child element:" + elementInitData.key);
        if(!onValueChangeGenerator) throw new Error("A callback generator is required for an react child element: " + elementInitData.key)
        let parentElement = this.form.getEntry(parentKey);
        if(!parentElement) throw new Error("Parent element " + parentKey + " not found for react child element " + elementInitData.key);
        
        let onValueChange = onValueChangeGenerator(this);
        if(onValueChange) {
            parentElement._addDependentCallback(onValueChange);
        }
    }

    /** This function adds a callback that came from config element initialization */
    _addDependentCallback(onValueChange) {
        if(!this.dependentCallbacks) {
            this._initForDependents();
        }
        this.dependentCallbacks.push(onValueChange);

        //call now to initialize state
        onValueChange(this.getValue());
    }

    /** This function calls all the onValueChange callbacks for dependent elements. */
    _callDependentCallbacks(value) {
        if(this.dependentCallbacks) {
            this.dependentCallbacks.forEach( onValueChange => onValueChange(value) );
        }
    }

    _initForDependents() {
        this.dependentCallbacks = [];
        this.addOnChange( (value,form) => this._callDependentCallbacks(value) );
    }
            
}

ConfigurableElement.CONTAINER_CLASS_STANDARD = "apogee_configurablePanelLine_standard";
ConfigurableElement.CONTAINER_CLASS_NO_MARGIN = "apogee_configurablePanelPanelLine_noMargin";
ConfigurableElement.CONTAINER_CLASS_INVISIBLE = "apogee_configurablePanelPanelLine_hidden";


