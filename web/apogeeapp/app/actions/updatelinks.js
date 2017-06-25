

apogeeapp.app.updatelinks = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.updatelinks.getUpdateLinksCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getWorkspaceUI();
        if(!activeWorkspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        apogeeapp.app.dialog.showUpdateLinksDialog(activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================
