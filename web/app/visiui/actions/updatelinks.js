

hax.app.visiui.updatelinks = {};

//=====================================
// UI Entry Point
//=====================================

hax.app.visiui.updatelinks.getUpdateLinksCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(!activeWorkspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        hax.app.visiui.dialog.showUpdateLinksDialog(activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================
