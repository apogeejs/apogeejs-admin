/** This is a panel with forma elements that can be configured using a javascript object.
 * 
 * @class 
 */
apogeeapp.ui.ConfigurablePanel = class {
    
    constructor(optionalContainerClassName = apogeeapp.ui.ConfigurablePanel.CONTAINER_CLASS_SELF_SIZED) {
        this.elementObjects = [];
        this.panelElement = this.createPanelElement(optionalContainerClassName); 
    }
    
    configureForm(formInitData) {
        //clear data
        apogeeapp.ui.removeAllChildren(this.panelElement);
        this.elementObjects = [];
        //create elements
        formInitData.forEach(elementInitData => this.addToPanel(elementInitData));
    }
    
    /** This method returns the ConfigurableElement for the given key. */
    getEntry(key) {
        return this.elementObjects.find(elementObject => elementObject.getKey() == key);
    }

    /** This method returns the data value object for this given panel. */
    getValue() {
        var formValue = {};
        var addValue = elementObject => {
            if(elementObject.getState() != apogeeapp.ui.ConfigurableElement.STATE_INACTIVE) {
                var elementValue = elementObject.getValue();
                if(elementValue !== undefined) {
                    var key = elementObject.getKey();
                    formValue[key] = elementValue;
                }
            }
        }
        this.elementObjects.forEach(addValue);
        return formValue;
    }
    
    /** This method returns the data value object for this given panel. */
    setValue(formValue) {
        for(var key in formValue) {
            var entry = this.getEntry(key);
            if(entry) {
                entry.setValue(formValue[key]);
            }
        }
    }
    
    getElement() {
        return this.panelElement;
    }
    
    /** This is an alternate way to add a submit entry to the form. This is useful
     * if the layout has no other handlers in it and is a pure JSON object. This 
     * will then separate out any handlers from the layout. */
    addSubmit(onSubmit,
            onCancel,
            optionalSubmitLabel = apogeeapp.ui.SubmitElement.DEFAULT_SUBMIT_LABEL,
            optionalCancelLabel = apogeeapp.ui.SubmitElement.DEFAULT_CANCEL_LABEL) {
                
        var data = {};
        data.type = apogeeapp.ui.SubmitElement.TYPE_NAME;
        if(onSubmit) {
            data.onSubmit = onSubmit;
            data.submitLabel = optionalSubmitLabel;
        }
        if(onCancel) {
            data.onCancel = onCancel;
            data.cancelLabel = optionalCancelLabel;
        }
        
        this.addToPanel(data);
    }
    
    addOnChange(onChange) {
        this.elementObjects.forEach( elementObject => {if(elementObject.addOnChange) elementObject.addOnChange(onChange);} );
    }
    
    setDisabled(isDisabled) {
        var state = isDisabled ? apogeeapp.ui.ConfigurableElement.STATE_DISABLED :
                apogeeapp.ui.ConfigurableElement.STATE_NORMAL;
        this.elementObjects.forEach( elementObject => elementObject.setState(state) );
    }
    
    /** This method is used to register configurable elements with the panel */
    static addConfigurableElement(constructorFunction) {
        var type = constructorFunction.TYPE_NAME;
        apogeeapp.ui.ConfigurablePanel.elementMap[type] = constructorFunction;
    }
    
    //=================================
    // Private methods
    //=================================
    
    /** This creates the container element for the panel. */
    createPanelElement(containerClassName) {
        var panelElement = document.createElement("div");
        panelElement.className = containerClassName;
        return panelElement;
    }
    
    /** this is called internally to add an element to the panel. */
    addToPanel(elementInitData) {
        var type = elementInitData.type;
        if(!type) {
            throw new Error("Type not found for configurable form entry!");
        }
        
        var elementObject;
        if(type == "custom") {
            //special case - let the user construct an explict object from the base element
            elementObject = new apogeeapp.ui.ConfigurableElement(this,elementInitData);
            elementInitData.builderFunction(elementObject);
        }
        else {
            //standard case - lookup constructor and instantiate
            var constructor = apogeeapp.ui.ConfigurablePanel.getTypeConstructor(type);
            if(!constructor) {
                throw new Error("Type not found for configurable element: " + type);
            }

            elementObject = new constructor(this,elementInitData);
        }
        
        this.elementObjects.push(elementObject);
        var domElement = elementObject.getElement();
        if(domElement) {
            this.panelElement.appendChild(domElement);
        }
    }
    
    static getTypeConstructor(type) {
        return apogeeapp.ui.ConfigurablePanel.elementMap[type];
    }
}

//static fields
apogeeapp.ui.ConfigurablePanel.elementMap = {};

apogeeapp.ui.ConfigurablePanel.CONTAINER_CLASS_FILL_PARENT = "apogee_configurablePanelBody_fillParent";
apogeeapp.ui.ConfigurablePanel.CONTAINER_CLASS_SELF_SIZED = "apogee_configurablePanelBody_selfSized";




