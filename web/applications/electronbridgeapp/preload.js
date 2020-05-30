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
            onOpen(null,false,null);
        }
	},
	
	/** Saves file; onSave has on argument, the new metadata. If it is null the file was not saved. */
	saveFileAs: (fileMetadata,data,onSave) => {
		var {dialog} = require('electron').remote;

        //show file save dialog
        var options = {};
        if((fileMetadata)&&(fileMetadata.path)) options.defaultPath = fileMetadata.path;
        var fileSavePromise = dialog.showSaveDialog(options);
        fileSavePromise.then( dialogResult => {
            if((!dialogResult.canceled)&&(dialogResult.filePath)) {
                //save file to the given location
                var updatedFileMetadata = createFileMetaData(dialogResult.filePath);
                saveFileImpl(updatedFileMetadata,data,onSave);
            }
            else {
                onSave(null,false,null);
            }
        })
        .catch(err => {
            onSave(err,false,null);
        })
    },
    
    /** Saves file; onSave has on argument, the new metadata. If it is null the file was not saved. */
	saveFile: (fileMetadata,data,onSave) => {

        //show an alert dialog as a precaution to tell user we are writing to file system
        let saveOk = confirm("Save to file location: " + createDisplayPath(fileMetadata));
        if(saveOk) {
            //save file to the given location
            saveFileImpl(fileMetadata,data,onSave);
        }
        else {
            onSave(null,false,null);
        }
    },
    
	/** This opens a file. the argument onOpen is the callback with the args (err,data,fileMetadata). All null on not opened */
	openFile: (onOpen) => {
		//show file open dialog
        var {dialog} = require('electron').remote;

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

/** This method saves the file to the given file */
function saveFileImpl(fileMetadata,data,onSave) {
	var onComplete = function(err) {
		if(onSave) {
			let fileSaved = err ? false : true;
			onSave(err,fileSaved,fileMetadata);
		}
	}

	var fs = require('fs');
	fs.writeFile(fileMetadata.path,data,onComplete);
}

function createFileMetaData(path) {
	return {"path":path};
} 

function createDisplayPath(fileMetadata) {
    return fileMetadata.path;
}