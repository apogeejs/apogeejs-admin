

visicomp.app.visiui.updatelinks = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.updatelinks.getUpdateLinksCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(!activeWorkspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        visicomp.app.visiui.dialog.showUpdateLinksDialog(activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================
