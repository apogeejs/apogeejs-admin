
/** This method shows a save package dialog. I simply displays the text of
 * the workspace json for the user to copy and save elsewhere. */
visicomp.app.visiui.dialog.showSaveWorkspaceDialog = function(workspaceUI) {
    
    if((!workspaceUI)||(!workspaceUI.getWorkspace())) {
        alert("There is no workspace open.");
        return;
    }
    
    var workspaceText = JSON.stringify(workspaceUI.getWorkspace().toJson());

    var dialog = new visicomp.visiui.Dialog("Dialog",{"resizable":true,"movable":true});
    var content = document.createElement("div");
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Save Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"innerHTML":"Copy the data below and save it in a file to open later."}));
    content.appendChild(line);
    
    //input
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var inputElement = visicomp.visiui.createElement("textarea",{"value":workspaceText,"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onOk = function() {
        dialog.hide();
    }
    
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"OK","onclick":onOk}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    dialog.centerOnPage();
}

