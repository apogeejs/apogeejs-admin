

apogeeapp.app.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.saveworkspace.getSaveCallback = function(app,filename) {
    return function() {
        
        var workspaceText = apogeeapp.app.saveworkspace.getWorkspaceText(app);
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }
        
        //clear workspace dirty flag on completion of save
        var onSaveSuccess = () => app.clearWorkspaceIsDirty();
        
        if(filename === undefined) {
            apogeeapp.app.saveworkspace.showSaveDialog(workspaceText,onSaveSuccess);
        }
        else {
            apogeeapp.app.saveworkspace.saveFile(filename,workspaceText,onSaveSuccess);
        }
    }
}

apogeeapp.app.saveworkspace.getWorkspaceText = function(app) {
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
