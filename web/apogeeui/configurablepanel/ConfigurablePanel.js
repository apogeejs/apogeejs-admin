import ConfigurablePanelConstants from "/apogeeui/configurablepanel/ConfigurablePanelConstants.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is a panel with forma elements that can be configured using a javascript object.
 * 
 * @class 
 */
export default class ConfigurablePanel {
    
    constructor() {
        this.elementObjects = [];
        this.panelElement = this.createPanelElement(ConfigurablePanel.PANEL_CLASS); 
    }
    
    configureForm(formInitData) {
        
        //TEMPORARY - legacy check correction----------------------
        if((formInitData)&&(formInitData.constructor == Array)) {
            formInitData = {layout:formInitData};
        }
        //---------------------------------------------------------
        
        //check for an invalid input
        if((!formInitData)||(!formInitData.layout)||(formInitData.layout.constructor != Array)) {
            formInitData = ConfigurablePanel.getErrorMessageLayoutInfo("Invalid form layout!");
        }
        
        //clear data
        uiutil.removeAllChildren(this.panelElement);
        this.elementObjects = [];
        
        try {
            //create elements     
            formInitData.layout.forEach(elementInitData => this.addToPanel(elementInitData));

            //additional init
            if(formInitData.onChange) {
                this.addOnChange(formInitData.onChange);
            }

            if(formInitData.onSubmitInfo) {
                this.addSubmit(formInitData.onSubmitInfo.onSubmit,
                    formInitData.onSubmitInfo.onCancel,
                    formInitData.onSubmitInfo.submitLabel,
                    formInitData.onSubmitInfo.cancelLabel);
            }

            if(formInitData.disabled) {
                this.setDisabled(true);
            }
        }
        catch(error) {
            var errorMsg = "Error in panel: " + error.toString();
            if(error.stack) console.error(error.stack);
            
            //display an error layout
            //but only try this once. If the error layout throws an error jsut continue
            if(!formInitData.isErrorLayout) {
                var errorLayoutInfo = ConfigurablePanel.getErrorMessageLayoutInfo(errorMsg);
                this.configureForm(errorLayoutInfo);
            }
        }
    }
    
    /** This method returns the ConfigurableElement for the given key. */
    getEntry(key) {
        return this.elementObjects.find(elementObject => elementObject.getKey() == key);
    }

    /** This returns the meta value for the panel. */
    getMeta() {
        //create the meta value
        let meta = {};
        this.elementObjects.forEach(elementObject => {
            let childMeta = elementObject.getMeta();
            let childKey = elementObject.getKey();
            if((childMeta)&&(childKey)) {
                meta[childKey] = childMeta;
            }
        })
        return meta;
    }

    /** This method returns the data value object for this given panel. */
    getValue() {
        var formValue = {};
        var addValue = elementObject => {
            if(elementObject.getState() != ConfigurablePanelConstants.STATE_INACTIVE) {
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
    
    getChildEntries() {
        return this.elementObjects;
    }
    
    /** This is an alternate way to add a submit entry to the form. This is useful
     * if the layout has no other handlers in it and is a pure JSON object. This 
     * will then separate out any handlers from the layout. */
    addSubmit(onSubmit,
            onCancel,
            optionalSubmitLabel = ConfigurablePanelConstants.DEFAULT_SUBMIT_LABEL,
            optionalCancelLabel = ConfigurablePanelConstants.DEFAULT_CANCEL_LABEL) {
                
        var data = {};
        data.type = "submit";
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
    
    //takes a handler onChange(formValue,form)
    addOnChange(onChange) {
        let onChildChange = (childValue,form) => {
            var formValue = this.getValue();
            onChange(formValue,form);
        }
        this.elementObjects.forEach( elementObject => elementObject.addOnChange(onChildChange));
    }

    addOnInput(onInput) {
        let onChildInput = (childValue,form) => {
            var formValue = this.getValue();
            onInput(formValue,form);
        }
        this.elementObjects.forEach( elementObject => elementObject.addOnInput(onChildInput));
    }
    
    setDisabled(isDisabled) {
        this.elementObjects.forEach( elementObject => {
            if(elementObject._setDisabled) {
                elementObject._setDisabled(isDisabled);
            }
        });
    }
    
    /** This method is used to register configurable elements with the panel */
    static addConfigurableElement(constructorFunction) {
        var type = constructorFunction.TYPE_NAME;
        ConfigurablePanel.elementMap[type] = constructorFunction;
    }
    
    /** This method can be used to generate an error message layout. */
    static getErrorMessageLayoutInfo(errorMsg) {
        var layout = [];
        var entry = {};
        entry.type = "htmlDisplay";
        entry.html = "<em style='color:red'>" + errorMsg + "</em>";
        layout.push(entry);
        return {"layout":layout, "isErrorLayout": true};
    }
    
    //=================================
    // Private methods
    //=================================
    
    /** This creates the container element for the panel. */
    createPanelElement(containerClassName) {
        var panelElement = document.createElement("div");
        panelElement.className = containerClassName;
        //explicitly remove margin and padding
        panelElement.style.margin = "0px";
        panelElement.style.padding = "0px";
        return panelElement;
    }
    
    /** this is called internally to add an element to the panel. */
    addToPanel(elementInitData) {

        var elementObject = ConfigurablePanel.instantiateConfigurableType(this,elementInitData);

        if(elementObject.elementType == "ConfigurableLayoutContainer") {
            //add all child elements from this container to the child element list
            this.elementObjects.push(...elementObject.getChildElementObjects());
            //add the dome element for the container
            var domElement = elementObject.getElement();
            if(domElement) {
                this.panelElement.appendChild(domElement);
            }
        }
        else if(elementObject.elementType == "ConfigurableElement") {
            //add this element to the child element list
            this.elementObjects.push(elementObject);
            //add the dom element for the child element
            var domElement = elementObject.getElement();
            if(domElement) {
                this.panelElement.appendChild(domElement);
            }
        }
        
        else {
            throw new Error("Unknown form element class: " + typeof elementObject);
        }
    }

    static instantiateConfigurableType(form,elementInitData) {
        var type = elementInitData.type;
        if(!type) {
            throw new Error("Type not found for configurable form entry!");
        }
        
        var constructor = ConfigurablePanel.elementMap[type];
        if(!constructor) {
            throw new Error("Type not found for configurable element: " + type);
        }

        return new constructor(form,elementInitData);
    }
}

//static fields
ConfigurablePanel.elementMap = {};

ConfigurablePanel.PANEL_CLASS = "apogee_configurablePanelBody";
ConfigurablePanel.PANEL_CLASS_FILL_PARENT = "apogee_configurablePanelBody_fillParent";

//This is displayed if there is an invalid layout passed in
ConfigurablePanel.INVALID_INIT_DATA = {
    layout: [
        {
            type: "heading",
            text: "INVALID FORM LAYOUT!",
            level: 4
        }
    ]
}

ConfigurablePanel.EMPTY_LAYOUT = {
    layout: []
}



