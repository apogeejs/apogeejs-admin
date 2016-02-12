

visicomp.app.visiui.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.saveworkspace.getSaveCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            alert("There is no workspace open.");
            return
        }
        
        visicomp.app.visiui.dialog.showSaveWorkspaceDialog(app, activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================

//for now there is no action
