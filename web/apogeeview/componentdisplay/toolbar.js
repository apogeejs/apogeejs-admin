import {uiutil} from "/apogeeui/apogeeUiLib.js";

/** This namespace provides methods to create a standard save bar and other toolbars. */

export function getSaveBar(onSave,onCancel) {
    var saveDiv = uiutil.createElement("div",null,
        {
            //"display":"block",
            //"position":"relative",
            //"top":"0px",
            "backgroundColor":"white",
            "border":"solid 1px gray",
            "padding":"3px"
        });

    saveDiv.appendChild(document.createTextNode("Edit: "));
    saveDiv.className = "visiui_hideSelection";

    var saveBarSaveButton = document.createElement("button");
    saveBarSaveButton.innerHTML = "Save";
    saveBarSaveButton.onclick = onSave;
    saveBarSaveButton.className = "visiui_hideSelection";
    saveDiv.appendChild(saveBarSaveButton);

    saveDiv.appendChild(document.createTextNode(" "));

    var saveBarCancelButton = document.createElement("button");
    saveBarCancelButton.innerHTML = "Cancel";
    saveBarCancelButton.onclick = onCancel;
    saveBarCancelButton.className = "visiui_hideSelection";
    saveDiv.appendChild(saveBarCancelButton);
    
    return saveDiv;
}
