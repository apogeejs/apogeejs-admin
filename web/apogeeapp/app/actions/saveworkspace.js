

apogeeapp.app.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.saveworkspace.getSaveCallback = function(app,filename) {
    return function() {
        
        var workspaceText = apogeeapp.app.saveworkspace.getWorkspaceText();
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }
        
        if(filename === undefined) {
            apogeeapp.app.saveworkspace.showSaveDialog(workspaceText);
        }
        else {
            apogeeapp.app.saveworkspace.saveFile(filename,workspaceText);
        }
    }
}

apogeeapp.app.saveworkspace.getWorkspaceText = function() {
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
//apogeeapp.app.saveworkspace.showSaveDialog = function(data);

//=====================================
// Action
//=====================================

//THIS METHOD MUST BE IMPLEMTED!
//apogeeapp.app.saveworkspace.saveFile = function(filename,data);
