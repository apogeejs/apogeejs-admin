/** This is an submit element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.SubmitElement = class extends apogeeapp.ui.ConfigurableElement {
    
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //create the submit button
        if(elementInitData.onSubmit) {
            
            var onSubmit = () => {
                var formValue = form.getValue();
                elementInitData.onSubmit(formValue);
            }
            
            var submitLabel;
            if(elementInitData.submitLabel) { 
                submitLabel = elementInitData.submitLabel;
            }
            else {
                submitLabel = apogeeapp.ui.SubmitElement.DEFAULT_SUBMIT_LABEL;
            }
            
            this.submitButton = apogeeapp.ui.createElement("button",{"className":"apogee_configurablePanelButton","innerHTML":submitLabel,"onclick":onSubmit});
            containerElement.appendChild(this.submitButton);
        }
        else {
            this.submitButton = null;
        }
        
        //create the cancel button
        if(elementInitData.onCancel) {
            
            var onCancel = elementInitData.onCancel;
            
            var cancelLabel;
            if(elementInitData.cancelLabel) { 
                cancelLabel = elementInitData.cancelLabel;
            }
            else {
                cancelLabel = apogeeapp.ui.SubmitElement.DEFAULT_CANCEL_LABEL;
            }
            
            this.cancelButton = apogeeapp.ui.createElement("button",{"className":"apogee_configurablePanelButton","innerHTML":cancelLabel,"onclick":onCancel});
            containerElement.appendChild(this.cancelButton);
        }
        else {
            this.cancelButton = null;
        }      
    }

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action
    }
}
 
apogeeapp.ui.SubmitElement.DEFAULT_SUBMIT_LABEL = "OK";
apogeeapp.ui.SubmitElement.DEFAULT_CANCEL_LABEL = "Cancel";

apogeeapp.ui.SubmitElement.TYPE_NAME = "submit";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.SubmitElement.TYPE_NAME,apogeeapp.ui.SubmitElement);

