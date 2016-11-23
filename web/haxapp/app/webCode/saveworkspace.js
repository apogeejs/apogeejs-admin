

haxapp.app.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.saveworkspace.getSaveCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            alert("There is no workspace open.");
            return
        }
        
        haxapp.app.dialog.showSaveWorkspaceDialog(app, activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================

//for now there is no action
