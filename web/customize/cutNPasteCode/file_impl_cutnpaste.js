

//PASTE IMPLEMENTATION
haxapp.app.openworkspace.openFile = function(onOpen) {
    var onFileOpen = function(data) {
        onOpen(null,data);
    }
    haxapp.app.dialog.showOpenWorkspaceDialog(onFileOpen);
}

haxapp.app.saveworkspace.showSaveDialog = function(data) {
    haxapp.app.dialog.showSaveWorkspaceDialog(data);
}

haxapp.app.saveworkspace.saveFile = function(filename,data) {
    haxapp.app.saveworkspace.showSaveDialog(data);
}