import apogeeui from "/apogeeui/apogeeui.js";
import WindowFrame from "/apogeeui/window/WindowFrame.js";
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
    var dialog = new WindowFrame(options);
    return dialog;
}

dialogMgr.showDialog = function(dialog) {
    var shieldElement = apogeeui.createElement("div",null,apogeeui.DIALOG_SHIELD_STYLE);
    var dialogParent = new WindowParent(shieldElement);
    apogeeui.dialogLayer.appendChild(shieldElement);

    dialogParent.addWindow(dialog);
}

/** This method closes a dialog created with createDialog. It
 *hides the window and removes the modal shiled. */
dialogMgr.closeDialog = function(dialog) {
    var parent = dialog.getParent();
    dialog.close();
    apogeeui.dialogLayer.removeChild(parent.getOuterElement());
}