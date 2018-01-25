/** This is a panel with forma elements that can be configured using a javascript object.
 * 
 * @class 
 */
apogeeapp.ui.ConfigurablePanel = class {
    
    constructor(formInitData) {
        this.elementObjects = [];
        this.panelElement = this.createPanelElement();
        
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
            var elementValue = elementObject.getValue();
            if(elementValue !== undefined) {
                var key = elementObject.getKey();
                formValue[key] = elementValue;
            }
        }
        this.elementObjects.forEach(addValue);
        return formValue;
    }
    
    getElement() {
        return this.panelElement;
    }
    
    /** This method is used to register configurable elements with the panel */
    static addConfigurableElement(type,constructor) {
        apogeeapp.ui.ConfigurablePanel.elementMap[type] = constructor;
    }
    
    //=================================
    // Private methods
    //=================================
    
    /** This creates the container element for the panel. */
    createPanelElement() {
        var panelElement = document.createElement("div");
        panelElement.style.position = "absolute";
        panelElement.style.top = "0px";
        panelElement.style.left = "0px";
        panelElement.style.bottom = "0px";
        panelElement.style.right = "0px";
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
            //special case - just use the object passed in
            elementObject = elementInitData.customObject;
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




