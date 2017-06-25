

//PASTE IMPLEMENTATION
apogeeapp.app.openworkspace.openFile = function(onOpen) {
    var onFileOpen = function(data) {
        onOpen(null,data);
    }
    apogeeapp.app.dialog.showOpenWorkspaceDialog(onFileOpen);
}

apogeeapp.app.saveworkspace.showSaveDialog = function(data) {
    apogeeapp.app.dialog.showSaveWorkspaceDialog(data);
}

apogeeapp.app.saveworkspace.saveFile = function(filename,data) {
    apogeeapp.app.saveworkspace.showSaveDialog(data);
}