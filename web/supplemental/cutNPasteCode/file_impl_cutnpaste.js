

//PASTE IMPLEMENTATION
apogeeapp.app.openworkspace.openFile = function(onOpen) {
    var onFileOpen = function(data) {
        onOpen(null,data);
    }
    apogeeapp.app.dialog.showOpenWorkspaceDialog(onFileOpen);
}

apogeeapp.app.saveworkspace.showSaveDialog = function(data,onSaveSuccess) {
    apogeeapp.app.dialog.showSaveWorkspaceDialog(data);
    
    //assume it was saved...
    if(onSaveSuccess) onSaveSuccess();
}

apogeeapp.app.saveworkspace.saveFile = function(filename,data,onSaveSuccess) {
    apogeeapp.app.saveworkspace.showSaveDialog(data);
}