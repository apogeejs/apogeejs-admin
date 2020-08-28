import ConfigurablePanelConstants from "/apogeeui/configurablepanel/ConfigurablePanelConstants.js";
import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is an submit element configurable element.
 * 
 * @class 
 */
export default class SubmitElement extends ConfigurableElement {
    
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();

        this.submitDisabled = elementInitData.submitDisabled;
        this.cancelDisabled = elementInitData.cancelDisabled;

        let focusElementSet = false;
        
        //create the submit button
        if(elementInitData.onSubmit) {
            
            var onSubmit = () => {
                var formValue = form.getValue();
                elementInitData.onSubmit(formValue,form);
            }
            
            var submitLabel;
            if(elementInitData.submitLabel) { 
                submitLabel = elementInitData.submitLabel;
            }
            else {
                submitLabel = ConfigurablePanelConstants.DEFAULT_SUBMIT_LABEL;
            }
            
            this.submitButton = uiutil.createElement("button",{"className":"apogee_configurablePanelButton","innerHTML":submitLabel,"onclick":onSubmit});
            containerElement.appendChild(this.submitButton);

            this.setFocusElement(this.submitButton);
            focusElementSet = true;
        }
        else {
            this.submitButton = null;
        }
        
        //create the cancel button
        if(elementInitData.onCancel) {
            
            var onCancel = () => {
                elementInitData.onCancel(form);
            }
            
            var cancelLabel;
            if(elementInitData.cancelLabel) { 
                cancelLabel = elementInitData.cancelLabel;
            }
            else {
                cancelLabel = ConfigurablePanelConstants.DEFAULT_CANCEL_LABEL;
            }
            
            this.cancelButton = uiutil.createElement("button",{"className":"apogee_configurablePanelButton","innerHTML":cancelLabel,"onclick":onCancel});
            containerElement.appendChild(this.cancelButton);

            this.setFocusElement(this.cancelButton);
            focusElementSet = true;
        }
        else {
            this.cancelButton = null;
        }  

        this._setButtonState();    
        
        this._postInstantiateInit(elementInitData);
    }
    
    submitDisable(isDisabled) {
        this.submitDisabled = isDisabled;
        this._setButtonState();
    }
    
    cancelDisable(isDisabled) {
        this.cancelDisabled = isDisabled;
        this._setButtonState();
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.overallDisabled = isDisabled;
        this._setButtonState();
    }

    _setButtonState() {
        if(this.submitButton) this.submitButton.disabled = this.overallDisabled || this.submitDisabled;
        if(this.cancelButton) this.cancelButton.disabled = this.overallDisabled || this.cancelDisabled;
    }
}

SubmitElement.TYPE_NAME = "submit";
