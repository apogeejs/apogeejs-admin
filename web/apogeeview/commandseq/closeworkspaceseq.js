import {showSimpleActionDialog} from "/apogeeview/dialogs/SimpleActionDialog.js";

//=====================================
// UI Entry Point
//=====================================

export function closeWorkspace(app) {
    
    var activeWorkspaceManager = app.getWorkspaceManager();
    if(activeWorkspaceManager === null) {
        apogeeUserAlert("There is no workspace close.");
        return;
    }
    
    var commandData = {};
    commandData.type = "closeWorkspace";

    let doAction = () => app.executeCommand(commandData);

    //if the workspace is not saved give the user a warning and chance to cancel
    if(activeWorkspaceManager.getIsDirty()) {
        let cancelAction = () => true;
        let deleteMsg = "There is unsaved data. Are you sure you want to close the workspace?";
        apogeeUserConfirm(deleteMsg,"Close","Cancel",doAction,cancelAction);
    }
    else {
        doAction();
    }
}


// //give focus back to editor
// if(parentComponentView) {
//     parentComponentView.giveEditorFocusIfShowing();
// }

