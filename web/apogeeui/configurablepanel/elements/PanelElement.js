import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import ConfigurablePanel from "/apogeeui/configurablepanel/ConfigurablePanel.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class PanelElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        //udpate padding and margin to 0
        containerElement.style.margin = ConfigurableElement.ELEMENT_MARGIN_NONE;
        containerElement.style.padding = ConfigurableElement.ELEMENT_PADDING_NONE;
        
        var formInitData = elementInitData.formData;
        this.panel = new ConfigurablePanel();
        this.panel.configureForm(formInitData);
        var panelElement = this.panel.getElement();
        containerElement.appendChild(panelElement);

        //add event listeners
        this.panel.addOnInput( () => this.inputDone() );
        this.panel.addOnChange( () => this.valueChanged() );
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.panel.getValue();
    }   

    /** This overrides the get meta element to calculate it on the fly. Because of list elements,
     * the meta value depends on the content. */
    getMeta() {
        if(this.meta) {
            let fullMeta = apogeeutil.jsonCopy(this.meta);
            fullMeta.childMeta = this.panel.getMeta();
            return fullMeta;
        }
        else {
            return null;
        }
    }

    /** We override the standard giveFocus method to pass it on to a child element. */
    giveFocus() {
        return this.panel.giveFocus();
    }

    //===================================
    // protected Methods
    //==================================

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValueImpl(value) {
        this.panel.setValue(value);
    }

    /** This function is used to inherit a child value from a parent value */
    inherit(childKey,parentValue) {
        let childElement = this.panel.getEntry(childKey);
        if((childElement)&&(childElement.getValue() != parentValue)) {
            childElement.setValue(parentValue);
        }    
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.panel.setDisabled(isDisabled);
    }
}

PanelElement.TYPE_NAME = "panel";



