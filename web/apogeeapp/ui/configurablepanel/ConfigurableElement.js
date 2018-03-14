/** This is an element that composes the content of a configurable panel.
 * 
 * @class 
 */
apogeeapp.ui.ConfigurableElement = class {
    constructor(form,elementInitData,optionalContainerClassName = apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_STANDARD) {
        this.form = form;
        this.key = elementInitData.key;
        this.domElement = apogeeapp.ui.createElement("div",{"className":optionalContainerClassName});
    }
    
    /** This method returns the key for this ConfigurableElement within this panel. */
    getKey() {
        return this.key;
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
            case apogeeapp.ui.ConfigurableElement.STATE_NORMAL:
                this._setVisible(true);
                this._setDisabled(false);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_DISABLED:
                this._setVisible(true);
                this._setDisabled(true);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_HIDDEN:
                this._setVisible(false);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_INACTIVE:
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
        
        var state = (elementInitData.state != undefined) ? elementInitData.state : apogeeapp.ui.ConfigurableElement.STATE_NORMAL;
        this.setState(state);
        
        //standard events
        if(elementInitData.onChange) {
            this.addOnChange(elementInitData.onChange);
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
}

apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_STANDARD = "apogee_configurablePanelLine_standard";
apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_NO_MARGIN = "apogee_configurablePanelPanelLine_noMargin";
apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_INVISIBLE = "apogee_configurablePanelPanelLine_hidden";

apogeeapp.ui.ConfigurableElement.STATE_NORMAL = "normal";
apogeeapp.ui.ConfigurableElement.STATE_DISABLED = "disabled";
apogeeapp.ui.ConfigurableElement.STATE_HIDDEN = "hidden";
apogeeapp.ui.ConfigurableElement.STATE_INACTIVE = "inactive";


