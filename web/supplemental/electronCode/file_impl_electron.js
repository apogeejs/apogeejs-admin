
//ELECTRON IMPLEMENTATION
apogeeapp.app.openworkspace.openFile = function(onOpen) {
    //show file open dialog
    var electron = require('electron').remote;
    var dialog = electron.dialog;

    var fileList = dialog.showOpenDialog({properties: ['openFile']});
    if((fileList)&&(fileList.length > 0)) {
        var fileMetadata = {};
        fileMetadata.directSaveOk = true;
        fileMetadata.path = fileList[0];
        var onFileOpen = function(err,data) {
            onOpen(err,data,fileMetadata);
        }
        
        var fs = require('fs');
        fs.readFile(fileMetadata.path,onFileOpen);
    }
}


apogeeapp.app.saveworkspace.showSaveDialog = function(fileMetadata,data,onSaveSuccess) {
    var electron = require('electron').remote;
    var dialog = electron.dialog;
    
    //show file save dialog
    var options = {};
    if((fileMetadata)&&(fileMetadata.path)) options.defaultPath = fileMetadata.path;
    var filename = dialog.showSaveDialog(options);
    
    //save file
    var updatedFileMetadata = {};
    updatedFileMetadata.directSaveOk = true;
    updatedFileMetadata.path = filename;
    if(filename) {
        apogeeapp.app.saveworkspace.saveFile(updatedFileMetadata,data,onSaveSuccess);
    }
    else {
        return false;
    }
}

apogeeapp.app.saveworkspace.saveFile = function(fileMetadata,data,onSaveSuccess) {
    var onComplete = function(err,data) {
        if(err) {
            alert("Error: " + err.message);
        }
        else {
            if(onSaveSuccess) {
                onSaveSuccess(fileMetadata);
            }
            alert("Saved!");
        }
    }

    var fs = require('fs');
    fs.writeFile(fileMetadata.path,data,onComplete);
}
