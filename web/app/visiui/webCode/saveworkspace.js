

hax.app.visiui.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

hax.app.visiui.saveworkspace.getSaveCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            alert("There is no workspace open.");
            return
        }
        
        hax.app.visiui.dialog.showSaveWorkspaceDialog(app, activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================

//for now there is no action
