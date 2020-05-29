/////////////////////////////////////////////////////////////////////////////////////////////////////

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const {contextBridge} = require('electron')
contextBridge.exposeInMainWorld('openSaveApi', {
	/** This loads the config file as ./config.json. onOpen has the args (err,data). Data is null for no config. */
	loadConfig: (onOpen) => {
		var fs = require('fs');
        
        //load file if it exists
        if(fs.existsSync(CONFIG_FILE_PATH)) {             
			fs.readFile(CONFIG_FILE_PATH,onOpen);
		}
        else { 
            //if there is no config file, just return an "empty" promise
            onOpen(null,null);
        }
	},
	
	/** Saves file; onSave has on argument, the new metadata. If it is null the file was not saved. */
	saveFile: (fileMetadata,data,onSave) => {
		var electron = require('electron').remote;
        var dialog = electron.dialog;

        //show file save dialog
        var options = {};
        if((fileMetadata)&&(fileMetadata.path)) options.defaultPath = fileMetadata.path;
        var newPath = dialog.showSaveDialog(options);

        //save file
        var updatedFileMetadata = ElectronFileAccess.createFileMetaData(newPath);
		if(updatedFileMetadata) {
            saveFileImpl(updatedFileMetadata,data,onSaveSuccess);
        }
		else {
			onSaveSucces(null);
		}
	},
	/** This opens a file. the argument onOpen is the callback with the args (err,data,fileMetadata). All null on not opened */
	openFile: (onOpen) => {
		//show file open dialog
        var electron = require('electron').remote;
        var dialog = electron.dialog;

        var fileOpenPromise = dialog.showOpenDialog({properties: ['openFile']});
		fileOpenPromise.then( fileOpenResult => {
			if((!fileOpenResult.canceled)&&(fileOpenResult.filePaths.length > 0)) {
				var fileMetadata = createFileMetaData(fileOpenResult.filePaths[0]);
				var onFileOpen = function(err,data) {
					onOpen(err,data,fileMetadata);
				}

				var fs = require('fs');
				fs.readFile(fileMetadata.path,'utf8',onFileOpen);
			}
			else {
				onOpen(null,null,null);
			}
		})
		.catch(err => {
			onOpen(err,null,null);
		});
        
	}
})

let CONFIG_FILE_PATH = "./config.json";

function saveFileImpl(fileMetadata,data,onSaveSuccess) {
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

function createFileMetaData(path) {
	return {"path":path};
} 