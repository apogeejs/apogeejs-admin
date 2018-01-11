

//PASTE IMPLEMENTATION
apogeeapp.app.openworkspace.openFile = function(onOpen) {
    var onFileOpen = function(data) {
        onOpen(null,data);
        return true;
    }

    var options = {};
    options.title = "Open Workspace";
    options.instructions = "Paste saved workspace data in the space below.";
    options.submitLabel = "Open";
    apogeeapp.app.dialog.showTextIoDialog(options,onFileOpen);
}

apogeeapp.app.saveworkspace.showSaveDialog = function(data,onSaveSuccess) {
    var onSubmit = () => true;
    var options = {};
    options.title = "Save Workspace";
    options.instructions = "Copy the data below and save it in a file to open later.";
    options.initialText = data;
    options.submitLabel = "Save";
    apogeeapp.app.dialog.showTextIoDialog(options,onSubmit);
    
    //assume it was saved...
    if(onSaveSuccess) onSaveSuccess();
}

apogeeapp.app.saveworkspace.saveFile = function(filename,data,onSaveSuccess) {
    apogeeapp.app.saveworkspace.showSaveDialog(data);
}