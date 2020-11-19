import uiutil from "/apogeeui/uiutil.js";
import DialogFrame from "/apogeeui/window/DialogFrame.js";
import WindowParent from "/apogeeui/window/WindowParent.js";

let dialogMgr = {};
export {dialogMgr as default};

/** This method creates a normal window which is situated above a shiled layer blocking
 *out events to the app, making the dialog like a modal dialog. If this function is used
 *to create a dialog, it must be closed with the dialogMgr.closeDialog function to
 *remove the modal layer, whether or not the dialog was shown. The options passed are the 
 *normal options for a window frame. (Note - if there are other events with whihc to act with
 *the app they may need to be shileded too.) */
dialogMgr.createDialog = function(options) {
    var dialog = new DialogFrame();
    return dialog;
}

dialogMgr.showDialog = function(dialog) {
    var shieldElement = uiutil.createElement("div",null,uiutil.DIALOG_SHIELD_STYLE);
    var dialogParent = new WindowParent(shieldElement);
    uiutil.dialogLayer.appendChild(shieldElement);

    dialogParent.addWindow(dialog);

    dialog.centerInParent();
}

/** This method closes a dialog created with createDialog. It
 *hides the window and removes the modal shiled. */
dialogMgr.closeDialog = function(dialog) {
    var parent = dialog.getParent();
    dialog.close();
    uiutil.dialogLayer.removeChild(parent.getOuterElement());
    parent.close();
}