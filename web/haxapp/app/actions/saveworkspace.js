

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
    var activeWorkspaceUI = app.getWorkspaceUI();
    if(activeWorkspaceUI) {
        var workspaceJson = activeWorkspaceUI.toJson();
        return JSON.stringify(workspaceJson);
    }
    else {
        return undefined;
    }
}
  
//THIS METHOD MUST BE IMPLEMTED!  
//haxapp.app.saveworkspace.showSaveDialog = function(data);

//=====================================
// Action
//=====================================

//THIS METHOD MUST BE IMPLEMTED!
//haxapp.app.saveworkspace.saveFile = function(filename,data);
