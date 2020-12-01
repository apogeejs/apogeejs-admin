
//=====================================
// UI Entry Point
//=====================================

/** This closes the workspace. The postCloseAction is optional. If this is included it will be executed if and after the
 * workspace is closed. */
export function closeWorkspace(app,postCloseAction) {
    
    var activeWorkspaceManager = app.getWorkspaceManager();
    if(activeWorkspaceManager === null) {
        apogeeUserAlert("There is no workspace close.");
        return;
    }
    
    var commandData = {};
    commandData.type = "closeWorkspace";

    let doClose = () => {
        let success = app.executeCommand(commandData);
        //add an optional action for after close - this is meant for opening a workspace, for one
        if((success)&&(postCloseAction)) {
            postCloseAction();
        }
    }

    //if the workspace is not saved give the user a warning and chance to cancel
    if(activeWorkspaceManager.getIsDirty()) {
        let cancelAction = () => true;
        let deleteMsg = "There is unsaved data. Are you sure you want to close the workspace?";
        apogeeUserConfirm(deleteMsg,"Close","Cancel",doClose,cancelAction);
    }
    else {
        doClose();
    }
}


