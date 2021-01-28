import {uiutil,dialogMgr,ConfigurablePanel} from "/apogeeui/apogeeUiLib.js";

/** This method shows a configurable dialog. The layout object
 * defines the form content for the dialog. The on submit
 * function is called when submit is pressed. The on submit function should
 * return true or false, indicating whether of not to close the dialog. */
export function showConfigurableDialog(layout,onSubmitFunction,optionalOnCancelFunction) {

    var dialog = dialogMgr.createDialog({"movable":true});
    let panel = new ConfigurablePanel();
    panel.configureForm(layout);

    let onCancel = function() {
        if(optionalOnCancelFunction) optionalOnCancelFunction();
        dialogMgr.closeDialog(dialog);
    }
    //submit
    let onSubmit = function(formValue) {
        //submit data
        var closeDialog = onSubmitFunction(formValue);
        if(closeDialog) {
            dialogMgr.closeDialog(dialog);
        }
    }

    panel.addSubmit(onSubmit,onCancel);
    
    //show dialog
    dialog.setContent(panel.getElement(),uiutil.SIZE_WINDOW_TO_CONTENT);
    dialogMgr.showDialog(dialog);

    //give focus to the panel
    panel.giveFocus();
}
    
    