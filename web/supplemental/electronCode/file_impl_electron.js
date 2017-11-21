
//ELECTRON IMPLEMENTATION
apogeeapp.app.openworkspace.openFile = function(onOpen) {
    //show file open dialog
    var electron = require('electron').remote;
    var dialog = electron.dialog;

    var fileList = dialog.showOpenDialog({properties: ['openFile']});
    if((fileList)&&(fileList.length > 0)) {
        var name = fileList[0];
        var onFileOpen = function(err,data) {
            onOpen(err,data,name);
        }
        
        var fs = require('fs');
        fs.readFile(name,onFileOpen);
    }
}


apogeeapp.app.saveworkspace.showSaveDialog = function(data,onSaveSuccess) {
    var electron = require('electron').remote;
    var dialog = electron.dialog;
    var filename = dialog.showSaveDialog();
    if(filename) {
        apogeeapp.app.saveworkspace.saveFile(filename,data,onSaveSuccess);
    }
    else {
        return false;
    }
}

apogeeapp.app.saveworkspace.saveFile = function(filename,data,onSaveSuccess) {
    var onComplete = function(err,data) {
        if(err) {
            alert("Error: " + err.message);
        }
        else {
            if(onSaveSuccess) {
                onSaveSuccess();
            }
            alert("Saved!");
        }
    }

    var fs = require('fs');
    fs.writeFile(filename,data,onComplete);
}
