

hax.app.visiui.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

hax.app.visiui.saveworkspace.getSaveCallback = function(app,filename) {
    return function() {
        
        var workspaceText = hax.app.visiui.saveworkspace.getWorkspaceText();
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }
        
        if(filename === undefined) {
            hax.app.visiui.saveworkspace.showSaveDialog(workspaceText);
        }
        else {
            hax.app.visiui.saveworkspace.saveFile(filename,workspaceText);
        }
    }
}

hax.app.visiui.saveworkspace.getSaveAsCallback = function(app) {
    return function() {       
        var workspaceText = hax.app.visiui.saveworkspace.getWorkspaceText();
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }
        hax.app.visiui.saveworkspace.showSaveDialog(workspaceText);
    }
}

hax.app.visiui.saveworkspace.getWorkspaceText = function() {
    var activeWorkspaceUI = app.getActiveWorkspaceUI();
    if(activeWorkspaceUI) {
        var workspaceJson = activeWorkspaceUI.toJson();
        return JSON.stringify(workspaceJson);
    }
    else {
        return undefined;
    }
}
    
hax.app.visiui.saveworkspace.showSaveDialog = function(data) {
    var electron = require('electron').remote;
    var dialog = electron.dialog;
    var filename = dialog.showSaveDialog();
    if(filename) {
        hax.app.visiui.saveworkspace.saveFile(filename,data);
    }
    else {
        return false;
    }
}

//=====================================
// Action
//=====================================

hax.app.visiui.saveworkspace.saveFile = function(filename,data) {
    var onComplete = function(err,data) {
        if(err) {
            alert("Error: " + err.message);
        }
        else {
            alert("Saved!");
        }
    }

    var fs = require('fs');
    fs.writeFile(filename,data,onComplete);
}
