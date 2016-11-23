

haxapp.app.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.saveworkspace.getSaveCallback = function(app,filename) {
    return function() {
        
        var workspaceText = haxapp.app.saveworkspace.getWorkspaceText();
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }
        
        if(filename === undefined) {
            haxapp.app.saveworkspace.showSaveDialog(workspaceText);
        }
        else {
            haxapp.app.saveworkspace.saveFile(filename,workspaceText);
        }
    }
}

haxapp.app.saveworkspace.getSaveAsCallback = function(app) {
    return function() {       
        var workspaceText = haxapp.app.saveworkspace.getWorkspaceText();
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }
        haxapp.app.saveworkspace.showSaveDialog(workspaceText);
    }
}

haxapp.app.saveworkspace.getWorkspaceText = function() {
    var activeWorkspaceUI = app.getActiveWorkspaceUI();
    if(activeWorkspaceUI) {
        var workspaceJson = activeWorkspaceUI.toJson();
        return JSON.stringify(workspaceJson);
    }
    else {
        return undefined;
    }
}
    
haxapp.app.saveworkspace.showSaveDialog = function(data) {
    var electron = require('electron').remote;
    var dialog = electron.dialog;
    var filename = dialog.showSaveDialog();
    if(filename) {
        haxapp.app.saveworkspace.saveFile(filename,data);
    }
    else {
        return false;
    }
}

//=====================================
// Action
//=====================================

haxapp.app.saveworkspace.saveFile = function(filename,data) {
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
